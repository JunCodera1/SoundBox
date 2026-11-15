import { Router } from "express";
import { z } from "zod";
import { Song, Playlist, Play } from "../models/index.js";
import { parse, wrap } from "../utils/http.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { songDto, playlistDto } from "../services/present.js";
import { recommendFor } from "../services/taste.js";
import { assistantPlaylist } from "../services/assistant.js";

const router = Router();
const pop = { path: "artist", select: "username avatar" };

router.get("/home", optionalAuth, wrap(async (req, res) => {
  const [recent, trending, genres, playlists] = await Promise.all([
    Song.find().sort({ createdAt: -1 }).limit(12).populate(pop),
    Song.find().sort({ plays: -1, likes: -1 }).limit(12).populate(pop),
    Song.aggregate([{ $group: { _id: { $toLower: "$genre" }, name: { $first: "$genre" }, count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 12 }]),
    Playlist.find({ isPublic: true, "songs.0": { $exists: true } }).sort({ updatedAt: -1 }).limit(8).populate("owner", "username"),
  ]);
  const out = { recent: recent.map(songDto), trending: trending.map(songDto), genres: genres.map((g) => ({ name: g.name, count: g.count })), playlists: playlists.map((p) => playlistDto(p)) };
  if (req.user) {
    const plays = await Play.find({ user: req.user._id }).sort({ playedAt: -1 }).limit(40).populate({ path: "song", populate: pop });
    const seen = new Set();
    out.recentlyPlayed = plays.filter((p) => p.song && !seen.has(String(p.song._id)) && seen.add(String(p.song._id))).slice(0, 12).map((p) => songDto(p.song));
    out.recommended = (await recommendFor(req.user)).map(songDto);
  }
  res.json(out);
}));

router.post("/assistant", requireAuth, wrap(async (req, res) => {
  const { prompt, save } = parse(z.object({ prompt: z.string().trim().min(2).max(300), save: z.boolean().optional() }), req.body);
  const { songs, explanation } = await assistantPlaylist(prompt);
  let playlist = null;
  if (save && songs.length) {
    playlist = await Playlist.create({ name: prompt.slice(0, 60), desc: `Generated from “${prompt}”`, owner: req.user._id, songs: songs.map((s) => s._id) });
  }
  res.json({ mode: "local", explanation, songs: songs.map(songDto), playlistId: playlist ? String(playlist._id) : null });
}));

export default router;
