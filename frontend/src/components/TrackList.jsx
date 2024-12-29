import React, { useState } from "react";
import { FaPlay, FaHeart, FaComment, FaShare } from "react-icons/fa";
import { makeUnAuthenticatedPUTRequest } from "@/utils/serverHelper";
import CommentSection from "./CommentSection";

export default function TrackList({
  tracks,
  setCurrentTrack,
  setTracks,
  userId,
}) {
  const [expandedTrack, setExpandedTrack] = useState(null);

  const handleLikeToggle = async (trackId, isLiked) => {
    try {
      const endpoint = isLiked
        ? `/song/put/unlike/${trackId}`
        : `/song/put/like/${trackId}`;
      const response = await makeUnAuthenticatedPUTRequest(endpoint);

      setTracks((prevTracks) =>
        prevTracks.map((track) =>
          track._id === trackId ? { ...track, ...response } : track
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleCommentToggle = (trackId) => {
    setExpandedTrack(expandedTrack === trackId ? null : trackId);
  };

  return (
    <div className="space-y-8">
      {tracks.map((track) => {
        const isLiked = track.likedBy.includes(userId);
        const isExpanded = expandedTrack === track._id;

        return (
          <div
            key={track._id}
            className="bg-white rounded-lg shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <img
                  src={track.thumbnail}
                  alt={track.username}
                  className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-orange-500"
                />
                <div>
                  <p className="font-semibold text-lg">{track.username}</p>
                  <p className="text-sm text-gray-500">posted a track</p>
                </div>
              </div>
              <div className="relative group">
                <img
                  src={track.thumbnail}
                  alt={track.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => setCurrentTrack(track)}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white rounded-full p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-orange-600"
                >
                  <FaPlay className="w-8 h-8" />
                </button>
              </div>
              <h2 className="text-xl font-semibold mt-4">{track.name}</h2>
              <div className="flex items-center justify-between mt-4">
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleLikeToggle(track._id, isLiked)}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-colors duration-200 ${
                      isLiked
                        ? "bg-orange-500 text-white"
                        : "text-gray-600 hover:bg-orange-100"
                    }`}
                  >
                    <FaHeart
                      className={`w-5 h-5 ${
                        isLiked ? "text-white" : "text-orange-500"
                      }`}
                    />
                    <span>{track.likes}</span>
                  </button>
                  <button
                    onClick={() => handleCommentToggle(track._id)}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-colors duration-200 ${
                      isExpanded
                        ? "bg-orange-500 text-white"
                        : "text-gray-600 hover:bg-orange-100"
                    }`}
                  >
                    <FaComment
                      className={`w-5 h-5 ${
                        isExpanded ? "text-white" : "text-orange-500"
                      }`}
                    />
                    <span>{track.comments?.length || 0}</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-1 rounded-full text-gray-600 hover:bg-orange-100 transition-colors duration-200">
                    <FaShare className="w-5 h-5 text-orange-500" />
                  </button>
                </div>
              </div>
            </div>
            {isExpanded && (
              <div className="px-6 pb-6">
                <CommentSection
                  trackId={track._id}
                  comments={track.comments || []}
                  setComments={(newComments) =>
                    setTracks((prevTracks) =>
                      prevTracks.map((t) =>
                        t._id === track._id
                          ? { ...t, comments: newComments }
                          : t
                      )
                    )
                  }
                  userId={userId}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
