import mongoose from "mongoose";
import { config } from "./config.js";
import { createApp } from "./app.js";

await mongoose.connect(config.mongoUri);
console.log(`[db] connected to ${mongoose.connection.name}`);
const server = createApp().listen(config.port, () => console.log(`[api] http://localhost:${config.port}`));
const stop = () => server.close(() => mongoose.disconnect().then(() => process.exit(0)));
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
