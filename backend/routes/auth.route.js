import express from "express";
import { User } from "../model/user.model.js";
import bcrypt from "bcrypt";
import sendEmail from "../utils/sendEmail.js";
import getToken from "../utils/helpers.js";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/verifyToken.js";

import {
  login,
  logout,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
} from "../controllers/auth.controller.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);
router.post("/logout", logout);

router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

export default router;
