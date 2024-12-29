import express from "express";

import { Playlist } from "../model/playlist.model.js";
import { User } from "../model/user.model.js";
import authenticateToken from "../middleware/auth.js";

import passport from "passport";

import Joi from "joi";
import {
  addSongToPlaylist,
  createPlaylist,
  getPlaylistByArtistId,
  getPlaylistById,
  getPlaylistByName,
  getPlaylistCurrentUser,
  updatePlaylistById,
} from "../controllers/playlists.controller.js";

const router = express.Router();

// Route 1: Create playlist
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  createPlaylist
);

// Get a playlist by ID

router.get("/get/playlist/:playlistId", getPlaylistById);

router.put("/put/:playlistId", updatePlaylistById);

// Get all playlists made by me
// /get/me
router.get(
  "/get/me",
  passport.authenticate("jwt", { session: false }),
  getPlaylistCurrentUser
);

// Get all playlists made by an artist
// /get/artist/xyz
router.get("/get/artist/:artistId", getPlaylistByArtistId);

router.put(
  "/put/edit/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id } = req.params;

    try {
      // Find the playlist by ID
      const updatedPlaylist = await Playlist.findOneAndUpdate(
        { _id: id }, // Match by playlist ID
        { $set: req.body }, // Update the playlist fields with the body of the request
        { new: true } // Return the updated document
      );

      // Check if the playlist exists
      if (!updatedPlaylist) {
        return res.status(404).send({ message: "Playlist not found" });
      }

      // Check if the authenticated user is the owner of the playlist
      const user = await User.findById(req.user._id);
      if (!user._id.equals(updatedPlaylist.user)) {
        return res
          .status(403)
          .send({ message: "You are not authorized to edit this playlist" });
      }

      // Return the updated playlist
      return res.status(200).send({
        data: updatedPlaylist,
        message: "Playlist updated successfully",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send({ message: "Internal server error" });
    }
  }
);

// Add a song to a playlist
router.post("/add/song/:playlistId/:songId", addSongToPlaylist);

// Get playlist by name
router.get("/get/playlistname/:playlistName", getPlaylistByName);

// Remove song from playlist
router.put("/put/remove-song", async (req, res) => {
  const schema = Joi.object({
    playlistId: Joi.string().required(),
    songId: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });
  if (!user._id.equals(playlist.user)) {
    return res
      .status(403)
      .send({ message: "You are not authorized to edit this playlist" });
  }
  const index = playlist.songs.indexOf(req.body.songId);
  playlist.songs.splice(index, 1);
  await playlist.save();
  res
    .status(200)
    .send({ data: playlist, message: "Song removed from playlist" });
});

// User favourite playlist

router.get("/get/favourite", async (req, res) => {
  const user = await User.findById(req.user._id);
  const playlists = await Playlist.find({ _id: user.playlists });
  res.status(200).send({ data: playlists });
});

// Get random playlist
router.get("/get/random", async (req, res) => {
  const playlists = await Playlist.aggregate([{ $sample: { size: 10 } }]);
  res.status(200).send({ data: playlists });
});

// Get all playlists
router.get("/get", async (req, res) => {
  const playlists = await Playlist.find();
  res.status(200).send({ data: playlists });
});

// Delete playlist by id
router.delete("/delete/:id", async (req, res) => {
  const user = await User.findById(req.user._id);
  const playlist = await Playlist.findById(req.params.id);

  if (!playlist) {
    return res.status(404).send({ message: "Playlist not found" });
  }

  if (!user._id.equals(playlist.user)) {
    return res
      .status(403)
      .send({ message: "You are not authorized to edit this playlist" });
  }

  const index = user.playlists.indexOf(req.params.id);
  if (index !== -1) {
    user.playlists.splice(index, 1);
    await user.save();
  }

  await playlist.deleteOne();
  res.status(200).send({ data: playlist, message: "Playlist deleted" });
});

export default router;
