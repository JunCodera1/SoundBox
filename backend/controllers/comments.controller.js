import Comment from "../model/comment.model.js";
import { Song } from "../model/song.model.js";
import { User } from "../model/user.model.js";

export const addComments = async (req, res) => {
  try {
    const { trackId, userId, text } = req.body;

    const song = await Song.findById(trackId);
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    const newComment = new Comment({
      user: userId,
      text,
      song: trackId,
    });

    await newComment.save();

    song.comments.push(newComment._id);
    await song.save();

    // Populate the user information for the response
    await newComment.populate("user", "username");

    res.status(201).json({ comment: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getComments = async (req, res) => {
  try {
    const { trackId } = req.params;

    const comments = await Comment.find({ song: trackId })
      .populate("user", "username")
      .sort({ createdAt: -1 });

    res.status(200).json({ comments });
  } catch (error) {
    console.error("Error getting comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
