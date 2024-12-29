import mongoose from "mongoose";
import Joi from "joi";
import passwordComplexity from "joi-password-complexity";
import bcrypt from "bcryptjs";

// Create user schema
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, private: true },
    username: { type: String, required: true, unique: true },
    avatar: { type: String, default: "" },
    likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Playlist" }],
    subscribedArtists: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Artist" },
    ],
    isFollowed: { type: Boolean, default: false },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followersCount: { type: Number, default: 0 },
    isAdmin: { type: Boolean, default: false },
    lastLogin: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    // New fields for enhanced profile
    joinDate: { type: Date, default: Date.now },
    totalListeningTime: { type: Number, default: 0 },
    favoriteGenre: { type: String },
    recentlyPlayed: [
      {
        song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
        playedAt: { type: Date, default: Date.now },
      },
    ],
    stats: {
      songsListened: { type: Number, default: 0 },
      artistsDiscovered: { type: Number, default: 0 },
      topArtist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist" },
    },
    preferences: {
      theme: { type: String, enum: ["light", "dark"], default: "light" },
      language: { type: String, default: "en" },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true }
);

// Validate user input using Joi
const validate = (user) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: passwordComplexity().required().label("Password"),
    username: Joi.string().min(5).required().label("Username"),
    avatar: Joi.string().uri().label("Avatar"),
    // Add validation for new fields if necessary
  });
  return schema.validate(user);
};

// Method to check if entered password matches the hashed password in the database
userSchema.methods.isPasswordValid = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// New method to update user's listening stats
userSchema.methods.updateListeningStats = async function (songId, artistId) {
  this.stats.songsListened += 1;
  this.totalListeningTime += 1; // Assuming 1 minute per song, adjust as needed

  if (!this.stats.artistsDiscovered.includes(artistId)) {
    this.stats.artistsDiscovered.push(artistId);
  }

  // Update recently played
  this.recentlyPlayed.unshift({ song: songId });
  this.recentlyPlayed = this.recentlyPlayed.slice(0, 10); // Keep only last 10

  await this.save();
};

// New method to get user's top artists
userSchema.methods.getTopArtists = async function (limit = 5) {
  const topArtists = await this.model("User").aggregate([
    { $match: { _id: this._id } },
    { $unwind: "$recentlyPlayed" },
    {
      $lookup: {
        from: "songs",
        localField: "recentlyPlayed.song",
        foreignField: "_id",
        as: "song",
      },
    },
    { $unwind: "$song" },
    { $group: { _id: "$song.artist", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  return topArtists;
};

// Create user model
const User = mongoose.model("User", userSchema);

export { User, validate };
