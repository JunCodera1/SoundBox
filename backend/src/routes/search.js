import { Router } from "express";
import { z } from "zod";
import { Song, User, Playlist } from "../models/index.js";
import { parse, wrap, escapeRegex } from "../utils/http.js";
import { optionalAuth } from "../middleware/auth.js";
import { songDto, publicUser, playlistDto } from "../services/present.js";

const router = Router();
const q = z.object({ q: z.string().trim().min(1).max(100) });

router.get("/", optionalAuth, wrap(async (req, res) => {
  const { q: term } = parse(q, req.query);
  const rx = new RegExp(escapeRegex(term), "i");
  const artistsMatch = await User.find({ username: rx }).limit(10).select("username avatar bio followers following");
  const artistIds = artistsMatch.map((a) => a._id);
  const [songs, playlists] = await Promise.all([
    Song.find({ $or: [{ name: rx }, { genre: rx }, { description: rx }, { artist: { $in: artistIds } }] }).limit(60).populate("artist", "username avatar"),
    Playlist.find({ name: rx, $or: [{ isPublic: true }, ...(req.user ? [{ owner: req.user._id }] : [])] }).limit(10).populate("owner", "username"),
  ]);
  // Relevance: exact name > prefix > name contains > artist/genre/description.
  const lc = term.toLowerCase();
  const score = (s) => (s.name.toLowerCase() === lc ? 100 : s.name.toLowerCase().startsWith(lc) ? 80 : rx.test(s.name) ? 60 : s.artist && rx.test(s.artist.username || "") ? 40 : 20) + Math.min(s.plays, 50) / 10;
  songs.sort((a, b) => score(b) - score(a));
  res.json({ songs: songs.slice(0, 30).map(songDto), artists: artistsMatch.map(publicUser), playlists: playlists.map((p) => playlistDto(p)) });
}));

router.get("/suggest", wrap(async (req, res) => {
  const { q: term } = parse(q, req.query);
  const rx = new RegExp("^" + escapeRegex(term), "i");
  const [songs, artists, genres] = await Promise.all([
    Song.find({ name: rx }).limit(5).select("name"), User.find({ username: rx }).limit(3).select("username"), Song.distinct("genre", { genre: rx }),
  ]);
  res.json({ items: [...songs.map((s) => ({ type: "song", label: s.name })), ...artists.map((a) => ({ type: "artist", label: a.username })), ...genres.slice(0, 3).map((g) => ({ type: "genre", label: g }))].slice(0, 8) });
}));

export default router;
