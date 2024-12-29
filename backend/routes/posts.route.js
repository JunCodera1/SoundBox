import passport from "passport";
import express from "express";
import { create } from "domain";
import {
  createPost,
  getAllPost,
  addComment,
  getCommentsByPostId,
} from "../controllers/posts.controller.js";
import { getSongByUrl } from "../controllers/posts.controller.js";
import { getComments } from "../controllers/comments.controller.js";

const router = express.Router();

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  createPost
);

router.get(
  "/get/all",
  passport.authenticate("jwt", { session: false }),
  getAllPost
);

router.get("/get/song/:songUrl", getSongByUrl);

router.post(
  "/:postId/comments",
  passport.authenticate("jwt", { session: false }),
  addComment
);

router.get(
  "/get/:postId/comments",
  passport.authenticate("jwt", { session: false }),
  getComments
);
router.get(
  "/get/comments/:postId",
  passport.authenticate("jwt", { session: false }),
  getCommentsByPostId
);

export default router;
