import mongoose from "mongoose";
const { Schema } = mongoose;
const oid = (ref) => ({ type: Schema.Types.ObjectId, ref });

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 280 },
    isAdmin: { type: Boolean, default: false },
    likedSongs: [oid("Song")],
    followers: [oid("User")],
    following: [oid("User")],
    favoriteGenres: [{ type: String, trim: true }],
    // Privacy: everything private unless the user opts in.
    privacy: {
      showActivity: { type: Boolean, default: false },
      showPlaylists: { type: Boolean, default: true },
    },
    lastLogin: Date,
  },
  { timestamps: true }
);

const songSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    thumbnail: { type: String, default: "" },
    track: { type: String, required: true },
    genre: { type: String, required: true, trim: true },
    duration: Number,
    artist: oid("User"),
    description: { type: String, default: "", maxlength: 1000 },
    likes: { type: Number, default: 0 },
    plays: { type: Number, default: 0 },
    license: { type: String, default: "owner-provided" },
  },
  { timestamps: true }
);
songSchema.index({ genre: 1 });
songSchema.index({ artist: 1 });
songSchema.index({ plays: -1 });

const playlistSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    thumbnail: String,
    owner: { ...oid("User"), required: true },
    songs: [oid("Song")],
    collaborators: [oid("User")],
    desc: { type: String, default: "", maxlength: 500 },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const commentSchema = new Schema(
  { user: { ...oid("User"), required: true }, song: { ...oid("Song"), required: true }, text: { type: String, required: true, maxlength: 500 } },
  { timestamps: true }
);
commentSchema.index({ song: 1, createdAt: -1 });

const playSchema = new Schema({ user: { ...oid("User"), required: true }, song: { ...oid("Song"), required: true }, playedAt: { type: Date, default: Date.now } });
playSchema.index({ user: 1, playedAt: -1 });

const m = (name, schema, coll) => mongoose.models[name] || mongoose.model(name, schema, coll);
export const User = m("User", userSchema);
export const Song = m("Song", songSchema, "songs");
export const Playlist = m("Playlist", playlistSchema);
export const Comment = m("Comment", commentSchema);
export const Play = m("Play", playSchema);
