import dotenv from "dotenv";
import "express-async-errors";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";

dotenv.config(); // Load environment variables from .env file
const app = express(); // Create Express app

app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use("/api/users", userRoutes); // User Routes
app.use("/api/login", authRoutes); // Auth Routes

const PORT = process.env.PORT || 5000; // Set port
console.log(process.env.MONGODB_URI); // Log MongoDB URI
app.listen(PORT, () => {
  connectDB();
  console.log("Server started at http://localhost:" + PORT); // Start server
});
