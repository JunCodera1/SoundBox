import { Router } from "express";
import { Song, User, Play } from "../models/index.js";
import { wrap, idParam, HttpError } from "../utils/http.js";
import { requireAuth } from "../middleware/auth.js";
import { songDto } from "../services/present.js";
import { tasteProfile } from "../services/taste.js";

const router = Router();
router.use(requireAuth);

router.get("/favorites", wrap(async (req, res) => {
  const u = await User.findById(req.user._id).populate({ path: "likedSongs", populate: { path: "artist", select: "username avatar" } });
  res.json({ items: u.likedSongs.filter(Boolean).reverse().map(songDto) });
}));

router.put("/favorites/:songId", idParam("songId"), wrap(async (req, res) => {
  if (!(await Song.exists({ _id: req.params.songId }))) throw new HttpError(404, "Song not found");
  // The $ne filter makes the push atomic and idempotent; only bump the counter when it matched.
  const r = await User.updateOne({ _id: req.user._id, likedSongs: { $ne: req.params.songId } }, { $push: { likedSongs: req.params.songId } });
  if (r.matchedCount) await Song.updateOne({ _id: req.params.songId }, { $inc: { likes: 1 } });
  res.json({ ok: true, liked: true });
}));

router.delete("/favorites/:songId", idParam("songId"), wrap(async (req, res) => {
  const r = await User.updateOne({ _id: req.user._id, likedSongs: req.params.songId }, { $pull: { likedSongs: req.params.songId } });
  if (r.matchedCount) await Song.updateOne({ _id: req.params.songId, likes: { $gt: 0 } }, { $inc: { likes: -1 } });
  res.json({ ok: true, liked: false });
}));

router.get("/history", wrap(async (req, res) => {
  const plays = await Play.find({ user: req.user._id }).sort({ playedAt: -1 }).limit(100).populate({ path: "song", populate: { path: "artist", select: "username avatar" } });
  res.json({ items: plays.filter((p) => p.song).map((p) => ({ playedAt: p.playedAt, song: songDto(p.song) })) });
}));

router.delete("/history", wrap(async (req, res) => {
  const r = await Play.deleteMany({ user: req.user._id });
  res.json({ ok: true, removed: r.deletedCount });
}));

router.get("/taste", wrap(async (req, res) => res.json(await tasteProfile(req.user._id))));

export default router;
