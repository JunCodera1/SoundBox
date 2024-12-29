import dotenv from "dotenv";
import "express-async-errors";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/users.route.js";
import authRoutes from "./routes/auth.route.js";
import songRoutes from "./routes/songs.route.js";
import commentRoutes from "./routes/comments.route.js";
import postRoutes from "./routes/posts.route.js";
import playlistRoutes from "./routes/playlists.route.js";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { User } from "./model/user.model.js";
import rateLimit from "express-rate-limit";
import path from "path";
import { Song } from "./model/song.model.js";

// Load environment variables from .env file
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in environment variables");
}
const PORT = process.env.PORT || 5000;

const app = express(); // Create Express app
const __dirname = path.resolve();

// Apply rate limiting and CORS middleware globally
app.use(
  cors({
    origin: "http://localhost:5173", // Allow the frontend to connect
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods,
    credentials: true, // Include credentials if needed (cookies, etc.)
  })
);

app.use(express.json()); // Parse JSON bodies

// Routes
app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/song", songRoutes);
app.use("/playlist", playlistRoutes);
app.use("/comment", commentRoutes);
app.use("/post", postRoutes);
app.use(express.json({ limit: "25mb" }));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}
// Passport JWT Strategy
let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

// Định nghĩa strategy đầu tiên

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findOne({ _id: jwt_payload.identifier });

      if (user) {
        return done(null, user); // User tồn tại
      } else {
        return done(null, false); // Không tìm thấy user
      }
    } catch (err) {
      return done(err, false); // Xử lý lỗi
    }
  })
);

// Connect to the database and start the server
console.log("MongoDB URI:", process.env.MONGODB_URI);

app.listen(PORT, () => {
  connectDB();
  console.log("Server started at http://localhost:" + PORT);
});

// Error handling middleware for express-async-errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});
