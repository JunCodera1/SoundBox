import React, { useState } from "react";
import { makeAuthenticatedPOSTRequest } from "@/utils/serverHelper";
import { jwtDecode } from "jwt-decode"; // Lưu ý sửa lỗi: import jwtDecode không có dấu ngoặc nhọn.
import Cookies from "js-cookie";

export default function SuggestedArtists({ info }) {
  const token = Cookies.get("token");
  const [artists, setArtists] = useState(info); // Tạo state để lưu danh sách artists

  // Hàm xử lý follow
  const handleFollow = async (artistId) => {
    try {
      const currentUserId = jwtDecode(token).identifier;

      // Gửi yêu cầu follow
      const response = await makeAuthenticatedPOSTRequest(
        `/user/follow/${artistId}`,
        { currentUserId }
      );

      // Kiểm tra phản hồi từ server
      if (response.success) {
        console.log("Followed artist:", artistId);

        // Cập nhật UI ngay lập tức
        setArtists((prevArtists) =>
          prevArtists.map((artist) =>
            artist._id === artistId ? { ...artist, isFollowed: true } : artist
          )
        );
      } else {
        console.error("Failed to follow artist:", response.message);
      }
    } catch (error) {
      console.error("Error following artist:", error);
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
    <div className="w-80 p-6 bg-gray-900 border-l">
      <h2 className="text-lg font-semibold mb-4">Artists you should follow</h2>
      <div className="space-y-4">
        {info.map((artist) => (
          <div key={artist._id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={
                  artist.avatar ||
                  "https://i.pinimg.com/originals/fc/04/73/fc047347b17f7df7ff288d78c8c281cf.png"
                }
                alt={artist.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">{artist.username}</p>
                <p className="text-sm text-gray-500">
                  {artist.followers.length} followers
                </p>
              </div>
            </div>
            <button
              onClick={() => handleFollow(artist._id)} // Truyền ID của artist
              className={`px-3 py-1 rounded-full border 
                ${
                  artist.isFollowed
                    ? "bg-gray-500 text-white cursor-not-allowed"
                    : "bg-transparent border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                }`}
              disabled={artist.isFollowed} // Vô hiệu hóa nút nếu đã follow
            >
              {artist.isFollowed ? "Followed" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
