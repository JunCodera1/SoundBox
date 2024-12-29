import { Post } from "../model/post.model.js";
import Comment from "../model/comment.model.js";

export const createPost = async (req, res) => {
  try {
    const {
      title,
      description,
      trackUrl,
      trackName,
      thumbnailUrl,
      thumbnailName,
    } = req.body;
    const author = req.user._id;

    // Kiểm tra nếu thiếu dữ liệu
    if (!title || !description || !trackUrl || !author) {
      return res
        .status(400)
        .json({ message: "Title, description, and trackUrl are required." });
    }

    // Lưu trữ bài viết vào database (giả định bạn đang sử dụng MongoDB với Mongoose)
    const newPost = {
      title,
      description,
      trackUrl,
      trackName: trackName || "Unknown Track",
      thumbnailUrl: thumbnailUrl || null,
      thumbnailName: thumbnailName || null,
      createdAt: new Date(),
      author: author,
    };

    // Thêm vào cơ sở dữ liệu (giả sử bạn có model Post)
    const createdPost = await Post.create(newPost);

    // Trả về phản hồi thành công
    return res.status(201).json({
      message: "Post created successfully!",
      post: createdPost,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getSongByUrl = async (req, res) => {
  const { songUrl } = req.params;

  // Giải mã URL mã hóa (nếu cần)
  const decodedUrl = decodeURIComponent(songUrl);
  console.log("Decoded URL: ", decodedUrl);

  try {
    // Tìm bài hát trong cơ sở dữ liệu theo track URL đã giải mã
    const song = await Post.findOne({ trackUrl: decodedUrl });
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

export const addComment = async (req, res) => {
  const { postId } = req.params; // Retrieve postId from the URL params
  const { comment, attachment } = req.body; // Extract comment and attachment data from the request body
  console.log("Received comment: ", comment); // Ensure comment is coming through

  try {
    // Find the post to ensure it exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create the new comment
    const newComment = new Comment({
      user: req.user._id, // Assuming the user is authenticated
      post: postId,
      comment,
      attachment,
    });

    // Save the comment to the database
    await newComment.save();

    res.status(201).json(newComment); // Respond with the created comment
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getCommentsByPostId = async (req, res) => {
  const { postId } = req.params; // Extract postId from the route parameters

  try {
    // Fetch comments from the database using the postId
    const comments = await Comment.find({ post: postId });

    // Respond with the comments
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching comments" });
  }
};

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("user", "username avatar") // Populate user details (optional)
      .sort({ createdAt: -1 }); // Sort comments by creation date, most recent first
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Error fetching comments" });
  }
};
