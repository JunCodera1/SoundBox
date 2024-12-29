import express from "express";

import {
  checkFollowStatus,
  createUser,
  followUser,
  getAllUsers,
  getCurrentUser,
  getUserById,
  unFollowUser,
} from "../controllers/users.controller.js";
import passport from "passport";

const router = express.Router();
// Get all user
router.get("/get/users", getAllUsers);

// Get Logged-In User Details Route
router.get(
  "/get/users/me",
  passport.authenticate("jwt", { session: false }),
  getCurrentUser
);

// Get User by ID Route
router.get(
  "/get/users/:userId",
  getUserById
  // passport.authenticate("jwt-strategy-1", { session: false }),
);

router.post(
  "/follow/:userId",
  passport.authenticate("jwt", { session: false }),
  followUser
);

router.post(
  "/unfollow/:userId",
  passport.authenticate("jwt", { session: false }),
  unFollowUser
);
router.post(
  "/check-follow/:userId",
  passport.authenticate("jwt", { session: false }),
  checkFollowStatus
);
// Create user
router.post("/", createUser);

export default router;
