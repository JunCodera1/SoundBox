import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { config } from "../config.js";
import { HttpError } from "../utils/http.js";

export const AUDIO_TYPES = { "audio/mpeg": ".mp3", "audio/wav": ".wav", "audio/x-wav": ".wav", "audio/wave": ".wav", "audio/ogg": ".ogg", "audio/flac": ".flac", "audio/mp4": ".m4a", "audio/x-m4a": ".m4a", "audio/aac": ".aac", "audio/webm": ".webm" };
export const IMAGE_TYPES = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

for (const d of ["audio", "images"]) fs.mkdirSync(path.join(config.uploadDir, d), { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, file, cb) => cb(null, path.join(config.uploadDir, file.fieldname === "audio" ? "audio" : "images")),
  // Extension is derived from the validated MIME type, never from the client filename.
  filename: (_req, file, cb) => cb(null, crypto.randomBytes(16).toString("hex") + (AUDIO_TYPES[file.mimetype] || IMAGE_TYPES[file.mimetype])),
});

export const upload = multer({
  storage,
  limits: { fileSize: config.maxAudioBytes, files: 2, fields: 10 },
  fileFilter: (_req, file, cb) => {
    const ok = file.fieldname === "audio" ? AUDIO_TYPES[file.mimetype] : file.fieldname === "cover" ? IMAGE_TYPES[file.mimetype] : false;
    cb(ok ? null : new HttpError(400, `Unsupported file for "${file.fieldname}": ${file.mimetype}`), !!ok);
  },
}).fields([{ name: "audio", maxCount: 1 }, { name: "cover", maxCount: 1 }]);

export const removeUploaded = (url) => {
  if (!url?.startsWith("/media/")) return;
  const rel = path.normalize(url.slice("/media/".length));
  if (rel.startsWith("..") || path.isAbsolute(rel)) return;
  fs.promises.unlink(path.join(config.uploadDir, rel)).catch(() => {});
};
