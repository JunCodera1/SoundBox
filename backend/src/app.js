import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "node:path";
import fs from "node:fs";
import { config } from "./config.js";
import { errorHandler } from "./utils/http.js";
import authRoutes from "./routes/auth.js";
import songRoutes from "./routes/songs.js";
import playlistRoutes from "./routes/playlists.js";
import meRoutes from "./routes/me.js";
import searchRoutes from "./routes/search.js";
import userRoutes from "./routes/users.js";
import discoverRoutes from "./routes/discover.js";
import adminRoutes from "./routes/admin.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", config.trustProxy);
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" }, contentSecurityPolicy: false }));
  app.use(cors({ origin: config.clientUrl.split(","), credentials: true, methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] }));
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  if (!config.isTest) app.use("/api", rateLimit({ windowMs: 60_000, limit: 600, standardHeaders: true, legacyHeaders: false }));

  // Uploaded media. express.static handles HTTP Range, which audio seeking needs.
  app.use("/media", express.static(config.uploadDir, { fallthrough: false, index: false, dotfiles: "deny", maxAge: "1h" }));

  app.get("/api/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));
  app.use("/api/auth", authRoutes);
  app.use("/api/songs", songRoutes);
  app.use("/api/playlists", playlistRoutes);
  app.use("/api/me", meRoutes);
  app.use("/api/search", searchRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/discover", discoverRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

  const dist = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../frontend/dist");
  if (config.isProd && fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
  }
  app.use(errorHandler);
  return app;
}
