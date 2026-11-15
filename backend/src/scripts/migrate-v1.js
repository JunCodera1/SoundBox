// Brings a database created by SoundBox v1 (tag legacy-v1) up to the v2 data model.
// Dry-run by default. Additive only: nothing is deleted. Take a backup first: mongodump --db <name>
//   node backend/src/scripts/migrate-v1.js            # report only
//   node backend/src/scripts/migrate-v1.js --apply    # write changes
import mongoose from "mongoose";
import { config } from "../config.js";
import { User, Song, Play } from "../models/index.js";

export async function migrateV1({ apply = false } = {}) {
  const db = mongoose.connection.db;
  const report = { emailsLowercased: 0, emailCollisions: [], likesMigrated: 0, songLikeCountsFixed: 0, historyMigrated: 0, legacyCommentsUntouched: 0, legacyPostsUntouched: 0 };

  // 1. v2 looks users up by lowercase email (v1 stored emails as typed).
  const users = await db.collection("users").find({}).toArray();
  const lower = new Map();
  for (const u of users) lower.set(u.email.toLowerCase(), (lower.get(u.email.toLowerCase()) || 0) + 1);
  for (const u of users) {
    if (u.email === u.email.toLowerCase()) continue;
    if (lower.get(u.email.toLowerCase()) > 1) { report.emailCollisions.push(u.email); continue; }
    report.emailsLowercased++;
    if (apply) await db.collection("users").updateOne({ _id: u._id }, { $set: { email: u.email.toLowerCase() } });
  }

  // 2. v1 kept likes on the song (likedBy); v2's source of truth is user.likedSongs.
  for (const s of await db.collection("songs").find({ likedBy: { $exists: true, $ne: [] } }).toArray()) {
    for (const uid of s.likedBy) {
      const has = await db.collection("users").countDocuments({ _id: uid, likedSongs: s._id });
      if (has) continue;
      report.likesMigrated++;
      if (apply) await db.collection("users").updateOne({ _id: uid }, { $addToSet: { likedSongs: s._id } });
    }
  }
  for (const s of await db.collection("songs").find({}).toArray()) {
    const n = await db.collection("users").countDocuments({ likedSongs: s._id });
    if ((s.likes || 0) !== n) { report.songLikeCountsFixed++; if (apply) await db.collection("songs").updateOne({ _id: s._id }, { $set: { likes: n } }); }
  }

  // 3. v1 embedded `recentlyPlayed` on the user; v2 has a Play collection.
  for (const u of await db.collection("users").find({ "recentlyPlayed.0": { $exists: true } }).toArray()) {
    if (await Play.exists({ user: u._id })) continue;
    for (const r of u.recentlyPlayed) { if (!r.song) continue; report.historyMigrated++; if (apply) await Play.create({ user: u._id, song: r.song, playedAt: r.playedAt || new Date() }); }
  }

  // 4. v1 comments targeted posts with {post, comment}; v2 comments target songs with {song, text}. Not convertible.
  report.legacyCommentsUntouched = await db.collection("comments").countDocuments({ song: { $exists: false } });
  report.legacyPostsUntouched = await db.collection("posts").countDocuments();
  return { apply, report };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await mongoose.connect(config.mongoUri);
  console.log(`[migrate-v1] database: ${mongoose.connection.name}`);
  console.log(JSON.stringify(await migrateV1({ apply: process.argv.includes("--apply") }), null, 2));
  await mongoose.disconnect();
}
export { User, Song };
