import { Song } from "../models/index.js";
import { escapeRegex } from "../utils/http.js";

// Local, deterministic fallback "assistant": maps free text to moods/genres and matches the REAL catalog.
// No external AI is required; tracks are never invented.
const MOODS = {
  focus: ["ambient", "chill", "classical", "lofi", "instrumental"],
  study: ["ambient", "chill", "classical", "lofi", "instrumental"],
  calm: ["ambient", "chill", "classical", "acoustic"],
  relax: ["ambient", "chill", "acoustic", "classical"],
  sleep: ["ambient", "classical"],
  rain: ["ambient", "chill"],
  sad: ["ambient", "classical", "acoustic"],
  happy: ["pop", "electronic", "dance", "funk"],
  workout: ["electronic", "dance", "rock", "hip-hop"],
  gym: ["electronic", "dance", "rock", "hip-hop"],
  run: ["electronic", "dance", "rock"],
  party: ["electronic", "dance", "pop", "hip-hop"],
  energy: ["electronic", "dance", "rock"],
  night: ["electronic", "chill", "ambient"],
  drive: ["rock", "electronic", "pop"],
};

export async function assistantPlaylist(prompt, limit = 12) {
  const words = prompt.toLowerCase().match(/[\p{L}\p{N}-]+/gu) || [];
  const wantedGenres = new Set(), matchedMoods = [];
  for (const w of words) if (MOODS[w]) { matchedMoods.push(w); MOODS[w].forEach((g) => wantedGenres.add(g)); }
  const known = await Song.distinct("genre");
  for (const g of known) if (words.includes(g.toLowerCase())) wantedGenres.add(g.toLowerCase());
  const terms = words.filter((w) => w.length > 2);
  const or = [];
  if (wantedGenres.size) or.push({ genre: { $in: [...wantedGenres].map((g) => new RegExp(`^${escapeRegex(g)}$`, "i")) } });
  for (const t of terms.slice(0, 8)) { const rx = new RegExp(escapeRegex(t), "i"); or.push({ name: rx }, { description: rx }); }
  if (!or.length) return { songs: [], explanation: "I couldn't find a mood, genre or keyword in that. Try something like “calm focus music” or “energetic workout”." };
  const songs = await Song.find({ $or: or }).sort({ plays: -1, createdAt: -1 }).limit(limit).populate("artist", "username avatar");
  const explanation = songs.length
    ? `Picked ${songs.length} track${songs.length > 1 ? "s" : ""} from the SoundBox catalog` + (matchedMoods.length ? ` for “${matchedMoods.join(", ")}”` : "") + (wantedGenres.size ? ` using genres: ${[...wantedGenres].join(", ")}.` : ".")
    : "Nothing in the current catalog matches that yet. Upload some music or try another mood.";
  return { songs, explanation };
}
