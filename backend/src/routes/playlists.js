import { Router } from "express";
import { z } from "zod";
import { Playlist, Song } from "../models/index.js";
import { HttpError, parse, wrap, idParam } from "../utils/http.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { playlistDto } from "../services/present.js";

const router = Router();
const objId = z.string().regex(/^[a-f\d]{24}$/i);
const deep = [{ path: "owner", select: "username" }, { path: "songs", populate: { path: "artist", select: "username avatar" } }];

const owned = async (req) => {
  const p = await Playlist.findById(req.params.id);
  if (!p) throw new HttpError(404, "Playlist not found");
  if (String(p.owner) !== String(req.user._id)) throw new HttpError(403, "Not your playlist");
  return p;
};

router.get("/mine", requireAuth, wrap(async (req, res) => {
  const items = await Playlist.find({ owner: req.user._id }).sort({ updatedAt: -1 }).populate("owner", "username");
  res.json({ items: items.map((p) => playlistDto(p)) });
}));

router.get("/public", wrap(async (_req, res) => {
  const items = await Playlist.find({ isPublic: true, "songs.0": { $exists: true } }).sort({ updatedAt: -1 }).limit(30).populate("owner", "username");
  res.json({ items: items.map((p) => playlistDto(p)) });
}));

router.post("/", requireAuth, wrap(async (req, res) => {
  const b = parse(z.object({ name: z.string().trim().min(1).max(100), desc: z.string().max(500).optional(), isPublic: z.boolean().optional(), songIds: z.array(objId).max(200).optional() }), req.body);
  const songs = b.songIds ? (await Song.find({ _id: { $in: b.songIds } }).select("_id")).map((s) => s._id) : [];
  const p = await Playlist.create({ name: b.name, desc: b.desc || "", isPublic: !!b.isPublic, owner: req.user._id, songs });
  await p.populate(deep);
  res.status(201).json({ playlist: playlistDto(p, { withSongs: true }) });
}));

router.get("/:id", idParam(), optionalAuth, wrap(async (req, res) => {
  const p = await Playlist.findById(req.params.id).populate(deep);
  // Private playlists look like they don't exist to anyone but the owner.
  if (!p || (!p.isPublic && String(p.owner._id) !== String(req.user?._id))) throw new HttpError(404, "Playlist not found");
  res.json({ playlist: playlistDto(p, { withSongs: true }), canEdit: String(p.owner._id) === String(req.user?._id) });
}));

router.patch("/:id", idParam(), requireAuth, wrap(async (req, res) => {
  const p = await owned(req);
  Object.assign(p, parse(z.object({ name: z.string().trim().min(1).max(100).optional(), desc: z.string().max(500).optional(), isPublic: z.boolean().optional() }).strict(), req.body));
  await p.save();
  await p.populate(deep);
  res.json({ playlist: playlistDto(p, { withSongs: true }) });
}));

router.delete("/:id", idParam(), requireAuth, wrap(async (req, res) => {
  await (await owned(req)).deleteOne();
  res.json({ ok: true });
}));

router.post("/:id/songs", idParam(), requireAuth, wrap(async (req, res) => {
  const p = await owned(req);
  const { songId } = parse(z.object({ songId: objId }), req.body);
  if (!(await Song.exists({ _id: songId }))) throw new HttpError(404, "Song not found");
  if (p.songs.some((s) => String(s) === songId)) throw new HttpError(409, "Song is already in this playlist");
  p.songs.push(songId);
  await p.save();
  res.json({ ok: true, songCount: p.songs.length });
}));

router.delete("/:id/songs/:songId", idParam(), idParam("songId"), requireAuth, wrap(async (req, res) => {
  const p = await owned(req);
  p.songs = p.songs.filter((s) => String(s) !== req.params.songId);
  await p.save();
  res.json({ ok: true, songCount: p.songs.length });
}));

router.put("/:id/order", idParam(), requireAuth, wrap(async (req, res) => {
  const p = await owned(req);
  const { songIds } = parse(z.object({ songIds: z.array(objId) }), req.body);
  const cur = p.songs.map(String).sort().join();
  if ([...songIds].sort().join() !== cur) throw new HttpError(400, "songIds must be a permutation of the playlist's songs");
  p.songs = songIds;
  await p.save();
  res.json({ ok: true });
}));

export default router;
