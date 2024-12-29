import express from "express";
import dotenv from "dotenv";
import {
  addComments,
  getComments,
} from "../controllers/comments.controller.js";
dotenv.config();

const router = express.Router();
router.post("/post/comment", addComments);

export default router;
