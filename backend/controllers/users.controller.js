import { User, validate } from "../model/user.model.js";

import bcrypt from "bcrypt";
import passport from "passport";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate("_id");
    return res.status(200).json({ data: users });
  } catch (error) {
    console.error("Error fetching songs:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("username email avatar");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createUser = async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  // Check if user already exists
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return res
      .status(403)
      .send({ message: "User with given email already exists!" });
  }
  // Hash password
  const salt = await bcrypt.genSalt(Number(process.env.SALT));
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  // Create new user
  const newUser = new User({
    ...req.body,
    password: hashPassword,
  });

  await newUser.save(); // Save User to DB

  newUser.password = undefined; // Hide password
  newUser.__v = undefined; // Hide key

  // Send response
  res
    .status(200)
    .send({ data: newUser, message: "Account created successfully" });
};

export const followUser = async (req, res) => {
  const { userId } = req.params;
  const { currentUserId } = req.body; // Extract currentUserId from the body

  console.log("userId:", userId);
  console.log("currentUserId:", currentUserId);

  if (!currentUserId) {
    return res.status(400).json({ message: "currentUserId is required" });
  }

  try {
    // Tìm người dùng và người theo dõi
    const user = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!user || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kiểm tra nếu đã theo dõi
    if (user.followers.includes(currentUserId)) {
      return res.status(400).json({ message: "User is already followed" });
    }

    // Thêm ID vào danh sách followers/following
    user.followers.push(currentUserId);
    currentUser.following.push(userId);

    // Cập nhật followersCount
    user.followersCount = user.followers.length;

    // Lưu lại dữ liệu
    await user.save();
    await currentUser.save();

    // Trả về kết quả
    res.json({
      message: "User followed successfully",
      followerCount: user.followersCount, // Trả về số lượng followers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const unFollowUser = async (req, res) => {
  const { currentUserId } = req.body;
  const { id: artistId } = req.params;

  try {
    const artist = await User.findById(artistId);
    if (!artist) {
      return res
        .status(404)
        .json({ success: false, message: "Artist not found" });
    }

    // Xóa userId khỏi danh sách followers
    artist.followers = artist.followers.filter(
      (followerId) => followerId.toString() !== currentUserId
    );
    await artist.save();

    res.json({ success: true, message: "Unfollowed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const checkFollowStatus = async (req, res) => {
  const { userId } = req.params;
  const { currentUserId } = req.body;

  if (!currentUserId) {
    return res.status(400).json({ message: "currentUserId is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowed = user.followers.includes(currentUserId);
    res.json({ isFollowed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
