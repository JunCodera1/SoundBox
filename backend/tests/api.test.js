import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.UPLOAD_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "sb-test-"));
const { config } = await import("../src/config.js");
const { createApp } = await import("../src/app.js");
const { User } = await import("../src/models/index.js");

const app = createApp();
const agent = () => request.agent(app);
const wavBuf = () => { const b = Buffer.alloc(44 + 2000); b.write("RIFF", 0); b.write("WAVEfmt ", 8); return b; };
const creds = (n) => ({ email: `${n}@test.local`, username: `user_${n}`, password: "Passw0rdOK" });

let alice, bob, admin, songId;

beforeAll(async () => {
  expect(config.mongoUri).toContain("soundbox_test"); // never touch another DB
  await mongoose.connect(config.mongoUri);
  await mongoose.connection.dropDatabase();
  alice = agent(); bob = agent(); admin = agent();
});
afterAll(async () => { await mongoose.connection.dropDatabase(); await mongoose.disconnect(); fs.rmSync(config.uploadDir, { recursive: true, force: true }); });

describe("health & auth", () => {
  it("health", async () => { expect((await request(app).get("/api/health")).body.ok).toBe(true); });
  it("rejects weak passwords and bad input", async () => {
    expect((await request(app).post("/api/auth/signup").send({ ...creds("x"), password: "short" })).status).toBe(400);
    expect((await request(app).post("/api/auth/signup").send({ email: "nope" })).status).toBe(400);
  });
  it("signs up, sets httpOnly cookie, never returns the password", async () => {
    const r = await alice.post("/api/auth/signup").send(creds("alice"));
    expect(r.status).toBe(201);
    expect(JSON.stringify(r.body)).not.toMatch(/password/i);
    expect(r.headers["set-cookie"][0]).toMatch(/HttpOnly/i);
    expect((await alice.get("/api/auth/me")).body.user.username).toBe("user_alice");
  });
  it("rejects duplicates, wrong password; same error for unknown email", async () => {
    expect((await request(app).post("/api/auth/signup").send(creds("alice"))).status).toBe(409);
    const a = await request(app).post("/api/auth/login").send({ email: "alice@test.local", password: "wrongpass1" });
    const b = await request(app).post("/api/auth/login").send({ email: "ghost@test.local", password: "wrongpass1" });
    expect(a.status).toBe(401); expect(b.body.error).toBe(a.body.error);
  });
  it("logout invalidates the session", async () => {
    const t = agent(); await t.post("/api/auth/signup").send(creds("temp"));
    await t.post("/api/auth/logout");
    expect((await t.get("/api/auth/me")).status).toBe(401);
  });
  it("protected endpoints require auth", async () => {
    for (const [m, u] of [["get", "/api/me/favorites"], ["get", "/api/playlists/mine"], ["post", "/api/songs"], ["get", "/api/admin/stats"]]) expect((await request(app)[m](u)).status).toBe(401);
  });
  it("a forged / tampered token grants nothing", async () => {
    expect((await request(app).get("/api/auth/me").set("Authorization", "Bearer abc.def.ghi")).status).toBe(401);
  });
});

describe("songs & uploads", () => {
  it("requires rights confirmation and a real audio file", async () => {
    const noRights = await alice.post("/api/songs").field("name", "T").field("genre", "Ambient").attach("audio", wavBuf(), { filename: "a.wav", contentType: "audio/wav" });
    expect(noRights.status).toBe(400);
    const exe = await alice.post("/api/songs").field("name", "T").field("genre", "Ambient").field("rightsConfirmed", "true").attach("audio", Buffer.from("MZ"), { filename: "evil.exe", contentType: "application/x-msdownload" });
    expect(exe.status).toBe(400);
    expect(fs.readdirSync(path.join(config.uploadDir, "audio"))).toHaveLength(0); // nothing left behind
  });
  it("uploads a song and serves it with Range support", async () => {
    const r = await alice.post("/api/songs").field("name", "My Track").field("genre", "Ambient").field("rightsConfirmed", "true").field("duration", "30").attach("audio", wavBuf(), { filename: "../../x.wav", contentType: "audio/wav" });
    expect(r.status).toBe(201);
    songId = r.body.song.id;
    expect(r.body.song.track).toMatch(/^\/media\/audio\/[a-f0-9]{32}\.wav$/);
    const ranged = await request(app).get(r.body.song.track).set("Range", "bytes=0-9");
    expect(ranged.status).toBe(206);
    expect((await request(app).get("/media/../package.json")).status).toBeGreaterThanOrEqual(400);
  });
  it("lists, filters, searches", async () => {
    expect((await request(app).get("/api/songs?genre=ambient")).body.total).toBe(1);
    expect((await request(app).get("/api/search?q=my tr")).body.songs[0].id).toBe(songId);
    expect((await request(app).get("/api/search?q=.*")).body.songs).toHaveLength(0); // regex chars are escaped
  });
  it("only the owner (or admin) can edit/delete", async () => {
    await bob.post("/api/auth/signup").send(creds("bob"));
    expect((await bob.patch(`/api/songs/${songId}`).send({ name: "Hacked" })).status).toBe(403);
    expect((await bob.delete(`/api/songs/${songId}`)).status).toBe(403);
    expect((await alice.patch(`/api/songs/${songId}`).send({ name: "Renamed" })).body.song.name).toBe("Renamed");
    expect((await alice.patch(`/api/songs/${songId}`).send({ isAdmin: true })).status).toBe(400); // strict schema
    expect((await request(app).get("/api/songs/not-an-id")).status).toBe(400);
  });
});

describe("favorites, history, playlists", () => {
  it("favorites are idempotent and keep the counter honest", async () => {
    await bob.put(`/api/me/favorites/${songId}`); await bob.put(`/api/me/favorites/${songId}`);
    expect((await request(app).get(`/api/songs/${songId}`)).body.song.likes).toBe(1);
    expect((await bob.get("/api/me/favorites")).body.items).toHaveLength(1);
    await bob.delete(`/api/me/favorites/${songId}`); await bob.delete(`/api/me/favorites/${songId}`);
    expect((await request(app).get(`/api/songs/${songId}`)).body.song.likes).toBe(0);
  });
  it("records plays (deduped) and builds history / taste", async () => {
    expect((await bob.post(`/api/songs/${songId}/play`)).body.counted).toBe(true);
    expect((await bob.post(`/api/songs/${songId}/play`)).body.counted).toBe(false);
    expect((await bob.get("/api/me/history")).body.items).toHaveLength(1);
    const taste = (await bob.get("/api/me/taste")).body;
    expect(taste.topGenres[0].name).toBe("Ambient");
  });
  it("playlists: CRUD, privacy, ownership, reorder", async () => {
    const created = await bob.post("/api/playlists").send({ name: "Mine", songIds: [songId] });
    const pid = created.body.playlist.id;
    expect(created.body.playlist.isPublic).toBe(false);
    expect((await request(app).get(`/api/playlists/${pid}`)).status).toBe(404); // private -> hidden
    expect((await alice.get(`/api/playlists/${pid}`)).status).toBe(404);
    expect((await alice.post(`/api/playlists/${pid}/songs`).send({ songId })).status).toBe(403);
    expect((await bob.post(`/api/playlists/${pid}/songs`).send({ songId })).status).toBe(409);
    await bob.patch(`/api/playlists/${pid}`).send({ isPublic: true });
    expect((await request(app).get(`/api/playlists/${pid}`)).status).toBe(200);
    expect((await bob.put(`/api/playlists/${pid}/order`).send({ songIds: [songId] })).status).toBe(200);
    expect((await bob.put(`/api/playlists/${pid}/order`).send({ songIds: [] })).status).toBe(400);
    expect((await alice.delete(`/api/playlists/${pid}`)).status).toBe(403);
    expect((await bob.delete(`/api/playlists/${pid}`)).status).toBe(200);
  });
  it("deleting a song cleans playlists/likes/files", async () => {
    const p = (await alice.post("/api/playlists").send({ name: "A", songIds: [songId] })).body.playlist.id;
    expect((await alice.delete(`/api/songs/${songId}`)).status).toBe(200);
    expect((await alice.get(`/api/playlists/${p}`)).body.playlist.songCount).toBe(0);
    await new Promise((r) => setTimeout(r, 100));
    expect(fs.readdirSync(path.join(config.uploadDir, "audio"))).toHaveLength(0);
  });
});

describe("social, privacy, admin, assistant", () => {
  it("activity is private by default and follow works", async () => {
    const me = (await alice.get("/api/auth/me")).body.user;
    const bobId = (await bob.get("/api/auth/me")).body.user.id;
    expect((await request(app).get(`/api/users/${bobId}`)).body.recentlyPlayed).toBeUndefined();
    expect((await alice.post(`/api/users/${bobId}/follow`)).body.following).toBe(true);
    expect((await alice.post(`/api/users/${me.id}/follow`)).status).toBe(400);
    expect((await alice.get(`/api/users/${bobId}`)).body.user.isFollowing).toBe(true);
    await bob.patch("/api/auth/me").send({ privacy: { showActivity: true } });
    expect((await request(app).get(`/api/users/${bobId}`)).body.recentlyPlayed).toBeDefined();
  });
  it("mass-assignment of isAdmin is rejected; admin routes need a real admin flag", async () => {
    expect((await alice.patch("/api/auth/me").send({ isAdmin: true })).status).toBe(400);
    expect((await alice.get("/api/admin/stats")).status).toBe(403);
    await admin.post("/api/auth/signup").send(creds("root"));
    await User.updateOne({ username: "user_root" }, { isAdmin: true });
    expect((await admin.get("/api/admin/stats")).status).toBe(200);
  });
  it("assistant answers from the catalog only", async () => {
    await alice.post("/api/songs").field("name", "Quiet Night").field("genre", "Ambient").field("rightsConfirmed", "true").attach("audio", wavBuf(), { filename: "q.wav", contentType: "audio/wav" });
    const r = await alice.post("/api/discover/assistant").send({ prompt: "calm focus music" });
    expect(r.body.mode).toBe("local");
    expect(r.body.songs.map((s) => s.name)).toContain("Quiet Night");
    expect((await alice.post("/api/discover/assistant").send({ prompt: "zzzz qqqq" })).body.songs).toHaveLength(0);
  });
});
