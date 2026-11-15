import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { User } from "../models/index.js";
import { HttpError, wrap } from "../utils/http.js";

export const signToken = (userId) => jwt.sign({ sub: String(userId) }, config.jwtSecret, { expiresIn: `${config.tokenTtlDays}d` });

export const setAuthCookie = (res, token) =>
  res.cookie(config.cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.isProd,
    maxAge: config.tokenTtlDays * 86400 * 1000,
    path: "/",
  });
export const clearAuthCookie = (res) => res.clearCookie(config.cookieName, { path: "/" });

async function load(req) {
  const header = req.headers.authorization;
  const token = req.cookies?.[config.cookieName] || (header?.startsWith("Bearer ") ? header.slice(7) : null);
  if (!token) return null;
  try {
    const { sub } = jwt.verify(token, config.jwtSecret);
    return await User.findById(sub);
  } catch {
    return null;
  }
}

/** Always re-reads the user from the database: permissions never come from the token. */
export const optionalAuth = wrap(async (req, _res, next) => {
  req.user = await load(req);
  next();
});
export const requireAuth = wrap(async (req, _res, next) => {
  req.user = await load(req);
  if (!req.user) throw new HttpError(401, "Authentication required");
  next();
});
export const requireAdmin = [
  requireAuth,
  (req, _res, next) => (req.user.isAdmin ? next() : next(new HttpError(403, "Admin only"))),
];
