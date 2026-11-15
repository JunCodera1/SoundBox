import { Play, Song, User } from "../models/index.js";

/** Aggregates real listening history. Returns null-ish fields when there's no data (nothing is invented). */
export async function tasteProfile(userId) {
  const plays = await Play.find({ user: userId }).sort({ playedAt: -1 }).limit(500).populate({ path: "song", populate: { path: "artist", select: "username" } });
  const valid = plays.filter((p) => p.song);
  const tally = (keyFn) => {
    const m = new Map();
    for (const p of valid) { const k = keyFn(p); if (k) m.set(k.id, { ...k, count: (m.get(k.id)?.count || 0) + 1 }); }
    return [...m.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  };
  const topGenres = tally((p) => ({ id: p.song.genre.toLowerCase(), name: p.song.genre }));
  const topArtists = tally((p) => p.song.artist && { id: String(p.song.artist._id), name: p.song.artist.username });
  const now = Date.now(), week = 7 * 864e5;
  const thisWeek = valid.filter((p) => now - p.playedAt < week).length;
  const prevWeek = valid.filter((p) => now - p.playedAt >= week && now - p.playedAt < 2 * week).length;
  const totalSeconds = valid.reduce((a, p) => a + (p.song.duration || 0), 0);
  return { totalPlays: valid.length, topGenres, topArtists, thisWeek, prevWeek, approxMinutes: Math.round(totalSeconds / 60), hasData: valid.length > 0 };
}

/** Songs the user may like: favourite/most-played genres & artists, excluding already-liked. */
export async function recommendFor(user, limit = 12) {
  const t = await tasteProfile(user._id);
  const genres = [...new Set([...t.topGenres.map((g) => g.name), ...(user.favoriteGenres || [])])];
  const artists = t.topArtists.map((a) => a.id);
  const filter = { _id: { $nin: user.likedSongs } };
  if (genres.length || artists.length) filter.$or = [...(genres.length ? [{ genre: { $in: genres.map((g) => new RegExp(`^${g.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")) } }] : []), ...(artists.length ? [{ artist: { $in: artists } }] : [])];
  return Song.find(filter).sort({ plays: -1, createdAt: -1 }).limit(limit).populate("artist", "username avatar");
}
export { User };
