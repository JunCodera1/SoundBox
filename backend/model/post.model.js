import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  trackUrl: { type: String, required: true },
  trackName: { type: String },
  thumbnailUrl: { type: String },
  thumbnailName: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Tham chiếu tới User

  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // Mảng tham chiếu tới Comment
  createdAt: { type: Date, default: Date.now },
});

export const Post = mongoose.model("Post", postSchema);
