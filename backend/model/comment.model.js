// comment.model.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    comment: { type: String, required: true },
    attachment: { type: String }, // Lưu URL của attachment (nếu có)
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment; // Default export
