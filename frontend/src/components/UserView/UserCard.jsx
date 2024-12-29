import { makeAuthenticatedPOSTRequest } from "@/utils/serverHelper";
import { jwtDecode } from "jwt-decode";
import React, { useState } from "react";
import Cookies from "js-cookie";
const UserCard = ({ info }) => {
  const token = Cookies.get("token");
  const [isFollowed, setIsFollowed] = useState(null);

  const handleFollow = async () => {
    // Implement your follow logic here
    try {
      const currentUserId = jwtDecode(token).identifier;
      console.log("currentUserId:", currentUserId);

      // Call your follow API here
      const response = await makeAuthenticatedPOSTRequest(
        `/user/follow/${info._id}`,
        { currentUserId }
      );
      console.log("Followed user:", info.username);
      console.log("Response:", response);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async (artistId) => {
    try {
      const currentUserId = jwtDecode(token).identifier;

      // Gửi yêu cầu unfollow
      const response = await makeAuthenticatedPOSTRequest(
        `/user/unfollow/${artistId}`,
        { currentUserId }
      );

      if (response.success) {
        console.log("Unfollowed artist:", artistId);

        // Cập nhật trạng thái unfollow
        setArtists((prevArtists) =>
          prevArtists.map((artist) =>
            artist._id === artistId ? { ...artist, isFollowed: false } : artist
          )
        );
      } else {
        console.error("Failed to unfollow artist:", response.message);
      }
    } catch (error) {
      console.error("Error unfollowing artist:", error);
    }
  };
  return (
    <div className="bg-gray-800 text-white p-5 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer">
      {/* Avatar */}
      <div className="flex justify-center pb-4">
        <img
          src={
            info.avatar ||
            "https://i.pinimg.com/originals/fc/04/73/fc047347b17f7df7ff288d78c8c281cf.png"
          }
          alt={`${info.username}'s avatar`}
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-700"
        />
      </div>

      {/* User Info */}
      <div className="text-center">
        <div className="font-bold text-lg mb-1">
          {info.username || "Username"}
        </div>
      </div>

      {/* Stats */}
      <div className="flex ml-4 text-gray-300 text-sm mt-4">
        <div>
          <span className="font-bold text-white">
            {info.followers.length || "0"}
          </span>{" "}
          Followers
        </div>
      </div>
      <button
        onClick={handleFollow}
        className="bg-transparent ml-3 border border-orange-500 text-orange-500 px-3 py-1 rounded-full hover:bg-orange-500 hover:text-white"
      >
        {isFollowed ? "Unfollow" : "Follow"}
      </button>
    </div>
  );
};

export default UserCard;
