import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { User } from "../models/index.js";
import { HttpError, parse, wrap } from "../utils/http.js";
import { signToken, setAuthCookie, clearAuthCookie, requireAuth } from "../middleware/auth.js";
import { selfUser } from "../services/present.js";
import { config } from "../config.js";

const router = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: config.isTest ? 1000 : 30, standardHeaders: true, legacyHeaders: false, message: { error: "Too many attempts, try again later" } });

const signupSchema = z.object({
  email: z.string().email().max(200),
  username: z.string().trim().min(3).max(30).regex(/^[\w.-]+$/, "letters, numbers, . _ - only"),
  password: z.string().min(8).max(128).regex(/[A-Za-z]/, "must contain a letter").regex(/\d/, "must contain a digit"),
});

router.post("/signup", limiter, wrap(async (req, res) => {
  const { email, username, password } = parse(signupSchema, req.body);
  if (await User.exists({ $or: [{ email: email.toLowerCase() }, { username }] })) throw new HttpError(409, "Email or username already in use");
  const user = await User.create({ email, username, password: await bcrypt.hash(password, 10) });
  setAuthCookie(res, signToken(user._id));
  res.status(201).json({ user: selfUser(user) });
}));

router.post("/login", limiter, wrap(async (req, res) => {
  const { email, password } = parse(z.object({ email: z.string().email(), password: z.string().min(1).max(128) }), req.body);
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  // Same response for unknown email and wrong password.
  if (!user || !(await bcrypt.compare(password, user.password))) throw new HttpError(401, "Invalid email or password");
  user.lastLogin = new Date();
  await user.save();
  setAuthCookie(res, signToken(user._id));
  res.json({ user: selfUser(user) });
}));

router.post("/logout", (_req, res) => { clearAuthCookie(res); res.json({ ok: true }); });

router.get("/me", requireAuth, (req, res) => res.json({ user: selfUser(req.user) }));

router.patch("/me", requireAuth, wrap(async (req, res) => {
  const b = parse(z.object({
    bio: z.string().max(280).optional(),
    avatar: z.string().max(500).optional(),
    favoriteGenres: z.array(z.string().trim().min(1).max(30)).max(10).optional(),
    privacy: z.object({ showActivity: z.boolean().optional(), showPlaylists: z.boolean().optional() }).optional(),
  }).strict(), req.body);
  const { privacy, ...rest } = b;
  Object.assign(req.user, rest);
  if (privacy) Object.assign(req.user.privacy, privacy);
  await req.user.save();
  res.json({ user: selfUser(req.user) });
}));

router.post("/password", requireAuth, limiter, wrap(async (req, res) => {
  const { current, next } = parse(z.object({ current: z.string(), next: signupSchema.shape.password }), req.body);
  const u = await User.findById(req.user._id).select("+password");
  if (!(await bcrypt.compare(current, u.password))) throw new HttpError(403, "Current password is incorrect");
  u.password = await bcrypt.hash(next, 10);
  await u.save();
  res.json({ ok: true });
}));

export default router;
