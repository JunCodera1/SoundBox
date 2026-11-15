import { ZodError } from "zod";
import mongoose from "mongoose";

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const parse = (schema, data) => {
  const r = schema.safeParse(data);
  if (!r.success) {
    const msg = r.error.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; ");
    throw new HttpError(400, msg);
  }
  return r.data;
};

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const validId = (id) => mongoose.isValidObjectId(id);
export const idParam = (name = "id") => (req, _res, next) => {
  if (!validId(req.params[name])) return next(new HttpError(400, "Invalid id"));
  next();
};

export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err instanceof ZodError) return res.status(400).json({ error: "Invalid input" });
  if (err?.code === 11000) return res.status(409).json({ error: "Already exists" });
  if (err?.name === "MulterError") return res.status(400).json({ error: err.code === "LIMIT_FILE_SIZE" ? "File too large" : err.message });
  if (err?.type === "entity.parse.failed") return res.status(400).json({ error: "Malformed JSON" });
  console.error("[error]", err?.stack || err);
  res.status(500).json({ error: "Internal server error" });
}
