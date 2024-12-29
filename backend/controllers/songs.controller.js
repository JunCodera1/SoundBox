import { Song } from "../model/song.model.js";
import { User } from "../model/user.model.js";

export const createSong = async (req, res) => {
  try {
    const { name, thumbnail, track, genre } = req.body;
    if (!name || !thumbnail || !track || !genre) {
      return res
        .status(400)
        .json({ error: "Insufficient details to create song." });
    }

    const artist = req.user._id;
    console.log(artist);
    const songDetails = { name, thumbnail, track, genre, artist };

    const createdSong = await Song.create(songDetails);
    return res.status(201).json(createdSong);
  } catch (err) {
    console.error("Error creating song:", err);
    return res.status(500).json({ error: "Error creating song." });
  }
};

export const getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find().populate("artist", "username"); // Only populate necessary fields
    return res.status(200).json({ data: songs });
  } catch (error) {
    console.error("Error fetching songs:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMySongs = async (req, res) => {
  try {
    const artistId = req.user._id;
    const songs = await Song.find({ artist: artistId }).populate("artist"); // Only populate necessary fields
    return res.status(200).json({ data: songs });
  } catch (error) {
    console.error("Error fetching songs:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSongByArtistId = async (req, res) => {
  const { artistId } = req.params;
  try {
    const artist = await User.findById(artistId);
    if (!artist) {
      return res.status(404).json({ error: "Artist does not exist" });
    }

    const songs = await Song.find({ artist: artistId });
    return res.status(200).json({ data: songs });
  } catch (error) {
    console.error("Error fetching songs by artist:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSongById = async (req, res) => {
  const { songId } = req.params;

  try {
    const song = await Song.findById(songId).populate("artist", "username");
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }
    res.status(200).json(song);
  } catch (error) {
    console.error("Error fetching song details:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateSongById = async (req, res) => {
  const { songId } = req.params;

  try {
    const song = await Song.findById(songId);
    console.log(req.user._id);
    console.log(song.artist.toString());
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    if (song.artist.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this song" });
    }

    const updatedSong = await Song.findByIdAndUpdate(songId, req.body, {
      new: true,
    });
    return res
      .status(200)
      .json({ data: updatedSong, message: "Song updated successfully" });
  } catch (err) {
    console.error("Error updating song:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteSongById = async (req, res) => {
  const { songId } = req.params;
  try {
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    if (song.artist.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this song" });
    }

    await Song.findByIdAndDelete(songId);
    res.status(200).json({ message: "Song deleted successfully" });
  } catch (error) {
    console.error("Error deleting song:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getSongByName = async (req, res) => {
  const { songName } = req.params;

  try {
    const songs = await Song.find({
      name: { $regex: songName, $options: "i" },
    }).populate("artist", "username");

    return res.status(200).json({ data: songs });
  } catch (err) {
    console.error("Error searching songs:", err);
    return res.status(500).json({ error: "Error searching songs" });
  }
};

export const getSongFeed = async (req, res) => {
  try {
    const songs = await Song.find({
      _id: { $in: req.user.likedSongs },
    }).populate("artist", "username");
    return res.status(200).json({ data: songs });
  } catch (error) {
    console.error("Error fetching liked songs:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getSongByGenre = async (req, res) => {
  try {
    const { songGenre } = req.params;
    // Create a case-insensitive regex pattern
    const genrePattern = new RegExp(songGenre, "i");
    console.log("Genre: ", songGenre);
    console.log("Genre Pattern: ", genrePattern);

    const songs = await Song.find({
      genre: genrePattern,
    }).populate("artist", "username");
    console.log("Songs: ", songs);
    // Check if any songs were found
    if (!songs || songs.length === 0) {
      console.log("Genre: ", songGenre);
      return res.status(404).json({
        message: `No songs found for genre: ${songGenre}`,
      });
    }

    return res.status(200).json({ data: songs });
  } catch (err) {
    console.error("Error searching songs:", err);
    return res.status(500).json({
      error: "Error searching songs",
      details: err.message,
    });
  }
};
export const likeSong = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  console.log("User ID: ", userId);
  console.log("Song ", id);

  try {
    const song = await Song.findById(id);
    if (!song) return res.status(404).json({ error: "Song not found." });

    if (!song.likedBy.includes(userId)) {
      song.likes += 1;
      song.likedBy.push(userId);
      await song.save();
    }

    res.status(200).json({ message: "Song liked successfully.", song });
  } catch (error) {
    console.error("Error liking the song:", error);
    res.status(500).json({ error: "Error liking the song." });
  }
};

export const unlikeSong = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const song = await Song.findById(id);
    if (!song) {
      return res.status(404).json({ error: "Song not found." });
    }

    if (song.likedBy.includes(userId)) {
      song.likes = Math.max(0, song.likes - 1);
      song.likedBy = song.likedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
      await song.save();
    }

    res.status(200).json({
      message: "Song unliked successfully.",
      likes: song.likes,
      likedBy: song.likedBy,
    });
  } catch (error) {
    console.error("Error unliking the song:", error);
    res.status(500).json({ error: "Error unliking the song." });
  }
};

export const checkLikedSong = async (req, res) => {
  try {
    const userId = req.user._id; // Lấy userId từ middleware xác thực
    const { songId } = req.params;

    const song = await Song.findById(songId);
    if (!song) {
      return res
        .status(404)
        .json({ success: false, message: "Song not found" });
    }

    const isLiked = song.likedBy.includes(userId.toString()); // Kiểm tra userId trong likedBy
    return res.status(200).json({ success: true, isLiked });
  } catch (error) {
    console.error("Error checking liked song:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
export const getSongByUrl = async (req, res) => {
  const { songUrl } = req.params;

  // Giải mã URL mã hóa (nếu cần)
  const decodedUrl = decodeURIComponent(songUrl);
  console.log("Decoded URL: ", decodedUrl);

  try {
    // Tìm bài hát trong cơ sở dữ liệu theo track URL đã giải mã
    const song = await Song.findOne({ track: decodedUrl });
    console.log("Song: ", song);

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    // Trả về thông tin bài hát nếu tìm thấy
    res.status(200).json(song);
  } catch (error) {
    console.error("Error fetching song:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
