// Isolated API for Playwright: its own database (soundbox_e2e), temp upload dir, port 5055.
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/soundbox_e2e";
process.env.UPLOAD_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "sb-e2e-"));
process.env.PORT = "5055";
process.env.JWT_SECRET = "e2e-only-secret";
process.env.CLIENT_URL = "http://localhost:4173";
const mongoose = (await import("mongoose")).default;
await mongoose.connect(process.env.MONGODB_URI);
await mongoose.connection.dropDatabase();
const { seed } = await import("./seed.js");
console.log("[e2e] seeded", await seed());
await import("../server.js");
