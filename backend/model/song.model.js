import mongoose from "mongoose";
import joi from "joi";

// Create song schema
const songSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  track: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
  },
  artist: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  description: {
    type: String,
  },
  likes: { type: Number, default: 0 }, // Store number of likes
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Optional: track users who liked
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});
songSchema.methods.addLike = async function (userId) {
  if (!this.likedBy.includes(userId)) {
    this.likes += 1;
    this.likedBy.push(userId);
    await this.save();
  }
};

songSchema.methods.removeLike = async function (userId) {
  if (this.likedBy.includes(userId)) {
    this.likes = Math.max(0, this.likes - 1);
    this.likedBy = this.likedBy.filter((id) => id !== userId);
    await this.save();
  }
};

// Validate song
const validate = (song) => {
  const schema = joi.object({
    name: joi.string().required(),
    thumbnail: joi.string().required(),
    track: joi.string().required(),
    artist: joi.string().required(),
  });
  return schema.validate(song);
};

// Create song model
const Song = mongoose.model("song", songSchema);

export { Song, validate };
