import { Router } from "express";
import { User, Song, Playlist, Comment, Play } from "../models/index.js";
import { wrap } from "../utils/http.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAdmin);

router.get("/stats", wrap(async (_req, res) => {
  const [users, songs, playlists, comments, plays] = await Promise.all([User.countDocuments(), Song.countDocuments(), Playlist.countDocuments(), Comment.countDocuments(), Play.countDocuments()]);
  res.json({ users, songs, playlists, comments, plays });
}));

router.get("/users", wrap(async (_req, res) => {
  const items = await User.find().sort({ createdAt: -1 }).limit(200).select("username email isAdmin createdAt");
  res.json({ items: items.map((u) => ({ id: String(u._id), username: u.username, email: u.email, isAdmin: u.isAdmin, createdAt: u.createdAt })) });
}));

export default router;
