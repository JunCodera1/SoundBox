import express from "express";
import {
  createSong,
  getAllSongs,
  getSongByArtistId,
  getSongById,
  updateSongById,
  deleteSongById,
  getSongByName,
  getSongFeed,
  likeSong,
  unlikeSong,
  getMySongs,
  getSongByGenre,
  checkLikedSong,
  getSongByUrl,
} from "../controllers/songs.controller.js";
import passport from "passport";

const router = express.Router();

// Create song route (now includes authentication)
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  createSong
);

router.get(
  "/get/mysongs",
  passport.authenticate("jwt", { session: false }),
  getMySongs
);

// Other routes remain the same
router.get(
  "/get/allSongs",
  // passport.authenticate("jwt", { session: false }),
  getAllSongs
);
// Get song by artist ID route (now includes authentication)
router.get(
  "/get/artist/:artistId",
  passport.authenticate("jwt", { session: false }),
  getSongByArtistId
);
// Get song by ID route (now includes authentication)
router.get(
  "/get/mysongs/:songId",
  passport.authenticate("jwt", { session: false }),
  getSongById
);
// Update song by ID route (now includes authentication)
router.put(
  "/put/:songId",
  passport.authenticate("jwt", { session: false }),
  updateSongById
);
// Delete song by ID route (now includes authentication)
router.delete(
  "/delete/song/:songId",
  passport.authenticate("jwt", { session: false }),
  deleteSongById
);
// Get song by name route
router.get("/get/songname/:songName", getSongByName);
router.get("/get/feed", getSongFeed);
// Get song by genre route
router.get("/get/genre/:songGenre", getSongByGenre);
// Like and unlike song routes (now includes authentication)
router.put(
  "/put/like/:id",
  passport.authenticate("jwt", { session: false }),
  likeSong
);
router.put(
  "/put/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  unlikeSong
);

router.get(
  "/get/check-like/:songId",
  passport.authenticate("jwt", { session: false }),
  checkLikedSong
);

router.get("/get/song/:songUrl", getSongByUrl);

export default router;
