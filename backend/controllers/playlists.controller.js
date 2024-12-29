import mongoose from "mongoose";

import { Playlist } from "../model/playlist.model.js";
import { User } from "../model/user.model.js";
import { Song } from "../model/song.model.js";

import passport from "passport";

import Joi from "joi";

export const createPlaylist = async (req, res) => {
  const currentUser = req.user; // Should be populated by passport
  const { name, thumbnail, songs } = req.body;

  if (!name || !thumbnail || !songs) {
    return res.status(400).send({ err: "Insufficient data" });
  }

  const playlistData = {
    name,
    thumbnail,
    songs,
    owner: currentUser._id,
    collabrators: [],
  };

  try {
    const playlist = await Playlist.create(playlistData);
    return res.status(200).send(playlist);
  } catch (error) {
    console.log(currentUser);
    console.error("Error creating playlist:", error);
    return res.status(500).send({ err: "Failed to create playlist" });
  }
};

export const getPlaylistById = async (req, res) => {
  const { playlistId } = req.params;

  try {
    // Tìm playlist theo _id và trả về nếu tìm thấy
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      // Nếu không tìm thấy playlist, trả về lỗi 404
      return res.status(404).json({ error: "Playlist not found" });
    }

    // Trả về thông tin playlist nếu tìm thấy
    return res.status(200).json(playlist);
  } catch (error) {
    // Nếu có lỗi trong quá trình truy vấn, trả về lỗi 500
    console.error(error); // Log lỗi để dễ dàng debug
    return res.status(500).json({ error: "Server error" });
  }
};

export const updatePlaylistById = async (req, res) => {
  const { playlistId } = req.params;

  try {
    // Tìm playlist theo tên (có thể thêm nhiều điều kiện khác như _id để đảm bảo tính duy nhất)
    const updatedPlaylist = await Playlist.findOneAndUpdate(
      { name: playlistId },
      { $set: req.body },
      { new: true } // Trả về playlist đã cập nhật
    );

    if (!updatedPlaylist) {
      return res.status(404).send({ message: "Playlist not found" });
    }

    return res.status(200).send({
      data: updatedPlaylist,
      message: "Playlist updated successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Internal server error" });
  }
};

export const getPlaylistCurrentUser = async (req, res) => {
  try {
    const artistId = req.user._id;
    console.log("Artist ID:", artistId);

    // Find playlists associated with the artist
    const playlists = await Playlist.find({ owner: artistId }).populate(
      "owner"
    );

    if (!playlists || playlists.length === 0) {
      return res.status(404).json({ err: "No playlists found for the user" });
    }

    return res.status(200).json({ data: playlists });
  } catch (error) {
    console.error("Error fetching playlists for user:", error);
    return res
      .status(500)
      .json({ err: "Server error while fetching playlists" });
  }
};

export const getPlaylistByArtistId = async (req, res) => {
  const artistId = req.params.artistId;

  // We can do this: Check if artist with given artist Id exists
  const artist = await User.findOne({ _id: artistId });
  if (!artist) {
    return res.status(304).json({ err: "Invalid Artist ID" });
  }

  const playlists = await Playlist.find({ owner: artistId });
  return res.status(200).json({ data: playlists });
};

export const addSongToPlaylist = async (req, res) => {
  const { playlistId, songId } = req.params;

  if (!playlistId || !songId) {
    return res.status(400).json({ error: "Playlist ID or Song ID is missing" });
  }

  // Fetch playlist and song by ID
  const playlist = await Playlist.findById(playlistId);
  const song = await Song.findById(songId);

  if (!playlist || !song) {
    return res.status(404).json({ error: "Playlist or Song not found" });
  }

  // Add the song to the playlist
  try {
    playlist.songs.push(songId); // Assuming there's a 'songs' array in the Playlist schema
    await playlist.save();
    return res
      .status(200)
      .json({ message: "Song added to playlist successfully" });
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    return res
      .status(500)
      .json({ error: "Server error while adding song to playlist" });
  }
};
export const getPlaylistByName = async (req, res) => {
  const { playlistName } = req.params;

  try {
    const playlists = await Playlist.find({
      name: { $regex: playlistName, $options: "i" }, // "i" là tùy chọn để tìm kiếm không phân biệt chữ hoa chữ thường
    }).populate("_id");

    return res.status(200).json({ data: playlists });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error searching playlists" });
  }
};
