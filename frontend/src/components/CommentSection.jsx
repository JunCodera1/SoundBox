import React, { useState, useEffect } from "react";
import { FaComment, FaPaperPlane } from "react-icons/fa";
import {
  makeUnAuthenticatedPOSTRequest,
  makeUnAuthenticatedGETRequest,
} from "@/utils/serverHelper";

export default function CommentSection({ trackId, userId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchComments();
  }, [trackId]);

  const fetchComments = async () => {
    try {
      const response = await makeUnAuthenticatedGETRequest(
        `/comment/get/comments/${trackId}`
      );
      if (response.error) {
        console.error("Error fetching comments:", response.error);
        return;
      }
      setComments(response.comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await makeUnAuthenticatedPOSTRequest("/post/comment", {
        trackId,
        userId,
        text: newComment,
      });

      if (response.error) {
        console.error("Error adding comment:", response.error);
        return;
      }

      setComments((prevComments) => [response.comment, ...prevComments]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>
      <div className="space-y-4 mb-4">
        {comments.map((comment) => (
          <div key={comment._id} className="bg-gray-100 rounded-lg p-3">
            <p className="font-semibold">{comment.user.username}</p>
            <p>{comment.text}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(comment.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={handleAddComment} className="flex items-center">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-grow border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="submit"
          className="bg-orange-500 text-white rounded-r-lg px-4 py-2 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}
