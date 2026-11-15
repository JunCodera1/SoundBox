import { Router } from "express";
import { z } from "zod";
import { Song, Playlist, User, Comment, Play } from "../models/index.js";
import { HttpError, parse, wrap, idParam, escapeRegex } from "../utils/http.js";
import { requireAuth } from "../middleware/auth.js";
import { songDto } from "../services/present.js";
import { upload, removeUploaded } from "../services/upload.js";

const router = Router();
const populateArtist = { path: "artist", select: "username avatar" };

const listQuery = z.object({
  q: z.string().trim().max(100).optional(),
  genre: z.string().trim().max(40).optional(),
  artist: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  sort: z.enum(["recent", "popular", "liked"]).default("recent"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
});

router.get("/", wrap(async (req, res) => {
  const { q, genre, artist, sort, page, limit } = parse(listQuery, req.query);
  const filter = {};
  if (q) filter.$or = [{ name: new RegExp(escapeRegex(q), "i") }, { genre: new RegExp(escapeRegex(q), "i") }];
  if (genre) filter.genre = new RegExp(`^${escapeRegex(genre)}$`, "i");
  if (artist) filter.artist = artist;
  const order = sort === "popular" ? { plays: -1, createdAt: -1 } : sort === "liked" ? { likes: -1, createdAt: -1 } : { createdAt: -1 };
  const [items, total] = await Promise.all([
    Song.find(filter).sort(order).skip((page - 1) * limit).limit(limit).populate(populateArtist),
    Song.countDocuments(filter),
  ]);
  res.json({ items: items.map(songDto), total, page, pages: Math.ceil(total / limit) });
}));

router.get("/genres", wrap(async (_req, res) => {
  const rows = await Song.aggregate([{ $group: { _id: { $toLower: "$genre" }, name: { $first: "$genre" }, count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
  res.json({ items: rows.map((r) => ({ name: r.name, count: r.count })) });
}));

router.get("/trending", wrap(async (_req, res) => {
  // Real counters only: plays recorded by authenticated listeners.
  const items = await Song.find().sort({ plays: -1, likes: -1, createdAt: -1 }).limit(20).populate(populateArtist);
  res.json({ items: items.map(songDto) });
}));

router.get("/:id", idParam(), wrap(async (req, res) => {
  const s = await Song.findById(req.params.id).populate(populateArtist);
  if (!s) throw new HttpError(404, "Song not found");
  res.json({ song: songDto(s) });
}));

router.get("/:id/similar", idParam(), wrap(async (req, res) => {
  const s = await Song.findById(req.params.id);
  if (!s) throw new HttpError(404, "Song not found");
  const items = await Song.find({ _id: { $ne: s._id }, $or: [{ genre: s.genre }, { artist: s.artist }] }).sort({ plays: -1 }).limit(10).populate(populateArtist);
  res.json({ items: items.map(songDto) });
}));

const createSchema = z.object({
  name: z.string().trim().min(1).max(140),
  genre: z.string().trim().min(1).max(40),
  description: z.string().max(1000).optional().default(""),
  duration: z.coerce.number().min(0).max(60 * 60 * 3).optional(),
  rightsConfirmed: z.enum(["true"], { message: "You must confirm you have the rights to distribute this audio" }),
});

router.post("/", requireAuth, upload, wrap(async (req, res) => {
  const files = req.files || {};
  const audio = files.audio?.[0], cover = files.cover?.[0];
  try {
    if (!audio) throw new HttpError(400, "An audio file is required");
    const b = parse(createSchema, req.body);
    const song = await Song.create({
      name: b.name, genre: b.genre, description: b.description, duration: b.duration,
      track: `/media/audio/${audio.filename}`,
      thumbnail: cover ? `/media/images/${cover.filename}` : "",
      artist: req.user._id, license: "uploader-confirmed-rights",
    });
    await song.populate(populateArtist);
    res.status(201).json({ song: songDto(song) });
  } catch (e) {
    removeUploaded(audio && `/media/audio/${audio.filename}`);
    removeUploaded(cover && `/media/images/${cover.filename}`);
    throw e;
  }
}));

const canEdit = (user, song) => user.isAdmin || String(song.artist) === String(user._id);

router.patch("/:id", idParam(), requireAuth, wrap(async (req, res) => {
  const s = await Song.findById(req.params.id);
  if (!s) throw new HttpError(404, "Song not found");
  if (!canEdit(req.user, s)) throw new HttpError(403, "Not your song");
  const b = parse(z.object({ name: z.string().trim().min(1).max(140).optional(), genre: z.string().trim().min(1).max(40).optional(), description: z.string().max(1000).optional() }).strict(), req.body);
  Object.assign(s, b);
  await s.save();
  await s.populate(populateArtist);
  res.json({ song: songDto(s) });
}));

router.delete("/:id", idParam(), requireAuth, wrap(async (req, res) => {
  const s = await Song.findById(req.params.id);
  if (!s) throw new HttpError(404, "Song not found");
  if (!canEdit(req.user, s)) throw new HttpError(403, "Not your song");
  await Promise.all([
    s.deleteOne(),
    Playlist.updateMany({ songs: s._id }, { $pull: { songs: s._id } }),
    User.updateMany({ likedSongs: s._id }, { $pull: { likedSongs: s._id } }),
    Comment.deleteMany({ song: s._id }),
    Play.deleteMany({ song: s._id }),
  ]);
  removeUploaded(s.track);
  removeUploaded(s.thumbnail);
  res.json({ ok: true });
}));

// Record a listen. Counts at most once per user/song per minute so plays can't be trivially inflated.
router.post("/:id/play", idParam(), requireAuth, wrap(async (req, res) => {
  const s = await Song.findById(req.params.id);
  if (!s) throw new HttpError(404, "Song not found");
  const recent = await Play.exists({ user: req.user._id, song: s._id, playedAt: { $gt: new Date(Date.now() - 60_000) } });
  if (!recent) {
    await Play.create({ user: req.user._id, song: s._id });
    await Song.updateOne({ _id: s._id }, { $inc: { plays: 1 } });
  }
  res.json({ ok: true, counted: !recent });
}));

router.get("/:id/comments", idParam(), wrap(async (req, res) => {
  const items = await Comment.find({ song: req.params.id }).sort({ createdAt: -1 }).limit(100).populate("user", "username avatar");
  res.json({ items: items.map((c) => ({ id: String(c._id), text: c.text, createdAt: c.createdAt, user: { id: String(c.user._id), username: c.user.username, avatar: c.user.avatar } })) });
}));

router.post("/:id/comments", idParam(), requireAuth, wrap(async (req, res) => {
  const { text } = parse(z.object({ text: z.string().trim().min(1).max(500) }), req.body);
  if (!(await Song.exists({ _id: req.params.id }))) throw new HttpError(404, "Song not found");
  const c = await Comment.create({ user: req.user._id, song: req.params.id, text });
  res.status(201).json({ comment: { id: String(c._id), text: c.text, createdAt: c.createdAt, user: { id: String(req.user._id), username: req.user.username, avatar: req.user.avatar } } });
}));

router.delete("/:id/comments/:commentId", idParam(), idParam("commentId"), requireAuth, wrap(async (req, res) => {
  const c = await Comment.findOne({ _id: req.params.commentId, song: req.params.id });
  if (!c) throw new HttpError(404, "Comment not found");
  if (!req.user.isAdmin && String(c.user) !== String(req.user._id)) throw new HttpError(403, "Not your comment");
  await c.deleteOne();
  res.json({ ok: true });
}));

export default router;
