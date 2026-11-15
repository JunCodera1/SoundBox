import { Router } from "express";
import { User, Song, Playlist, Play } from "../models/index.js";
import { HttpError, wrap, idParam } from "../utils/http.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { publicUser, songDto, playlistDto } from "../services/present.js";

const router = Router();

// Artists = users who published at least one song.
router.get("/artists", wrap(async (_req, res) => {
  const rows = await Song.aggregate([{ $group: { _id: "$artist", songs: { $sum: 1 }, plays: { $sum: "$plays" } } }, { $match: { _id: { $ne: null } } }, { $sort: { plays: -1, songs: -1 } }, { $limit: 24 }]);
  const users = await User.find({ _id: { $in: rows.map((r) => r._id) } });
  const byId = new Map(users.map((u) => [String(u._id), u]));
  res.json({ items: rows.filter((r) => byId.has(String(r._id))).map((r) => ({ ...publicUser(byId.get(String(r._id))), songs: r.songs, plays: r.plays })) });
}));

router.get("/:id", idParam(), optionalAuth, wrap(async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) throw new HttpError(404, "User not found");
  const self = String(req.user?._id) === String(u._id);
  const [songs, playlists] = await Promise.all([
    Song.find({ artist: u._id }).sort({ createdAt: -1 }).limit(50).populate("artist", "username avatar"),
    u.privacy.showPlaylists || self ? Playlist.find({ owner: u._id, ...(self ? {} : { isPublic: true }) }).populate("owner", "username") : [],
  ]);
  const out = { user: { ...publicUser(u), isFollowing: !!req.user?.following.some((f) => String(f) === String(u._id)), favoriteGenres: u.favoriteGenres }, songs: songs.map(songDto), playlists: playlists.map((p) => playlistDto(p)) };
  // Listening activity is private unless the user opted in (or it's you).
  if (self || u.privacy.showActivity) {
    const plays = await Play.find({ user: u._id }).sort({ playedAt: -1 }).limit(10).populate({ path: "song", populate: { path: "artist", select: "username avatar" } });
    out.recentlyPlayed = plays.filter((p) => p.song).map((p) => songDto(p.song));
  }
  res.json(out);
}));

router.post("/:id/follow", idParam(), requireAuth, wrap(async (req, res) => {
  if (String(req.user._id) === req.params.id) throw new HttpError(400, "You can't follow yourself");
  if (!(await User.exists({ _id: req.params.id }))) throw new HttpError(404, "User not found");
  await Promise.all([User.updateOne({ _id: req.user._id }, { $addToSet: { following: req.params.id } }), User.updateOne({ _id: req.params.id }, { $addToSet: { followers: req.user._id } })]);
  res.json({ ok: true, following: true });
}));

router.delete("/:id/follow", idParam(), requireAuth, wrap(async (req, res) => {
  await Promise.all([User.updateOne({ _id: req.user._id }, { $pull: { following: req.params.id } }), User.updateOne({ _id: req.params.id }, { $pull: { followers: req.user._id } })]);
  res.json({ ok: true, following: false });
}));

export default router;
