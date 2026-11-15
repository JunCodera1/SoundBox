import dotenv from "dotenv";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

const isProd = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (isProd) throw new Error("JWT_SECRET is required in production");
  jwtSecret = crypto.randomBytes(32).toString("hex");
  if (!isTest) console.warn("[config] JWT_SECRET not set: using an ephemeral secret (sessions reset on restart)");
}

export const config = {
  isProd,
  isTest,
  port: Number(process.env.PORT) || 5000,
  // Tests must never hit the dev/prod database, whatever .env says (override only via MONGODB_TEST_URI).
  mongoUri: isTest ? process.env.MONGODB_TEST_URI || "mongodb://127.0.0.1:27017/soundbox_test" : process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/soundbox_dev",
  jwtSecret,
  // Number of reverse-proxy hops to trust for X-Forwarded-For (0 = none, safe default when exposed directly).
  trustProxy: Number(process.env.TRUST_PROXY || 0),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  uploadDir: path.resolve(process.env.UPLOAD_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), "../uploads")),
  maxAudioBytes: 30 * 1024 * 1024,
  maxImageBytes: 5 * 1024 * 1024,
  cookieName: "sb_token",
  tokenTtlDays: 7,
};
