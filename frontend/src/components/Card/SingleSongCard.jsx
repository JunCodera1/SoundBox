import React, { useContext, useState, useEffect } from "react";
import { PlayCircle, MoreHorizontal } from "lucide-react";
import SongContext from "../SongContext";
import { Howl } from "howler";
import AddToPlaylistModal from "@/modals/AddToPlaylistModal"; // Import the AddToPlaylistModal
import { Heart } from "lucide-react"; // Import biểu tượng trái tim
import { Box, useColorModeValue } from "@chakra-ui/react";
import Cookies from "js-cookie";
import {
  makeAuthenticatedGETRequest,
  makeAuthenticatedPUTRequest,
  makeUnAuthenticatedPUTRequest,
} from "@/utils/serverHelper";
import UpdateSongModal from "@/modals/UpdateSongModal";
import { jwtDecode } from "jwt-decode";

// Helper function to format duration
const formatDuration = (durationInSeconds) => {
  const minutes = Math.floor(durationInSeconds / 60);
  let seconds = durationInSeconds % 60;
  seconds = seconds.toFixed(0);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

// Function to trigger file download programmatically
const downloadFile = (url, filename) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const SingleSongCard = ({ info, onPlay }) => {
  const { setCurrentSong } = useContext(SongContext);
  const [duration, setDuration] = useState(info.duration || null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); // State for the download modal
  const [addToPlaylistModalOpen, setAddToPlaylistModalOpen] = useState(false); // State for add to playlist modal
  const [updateSongModalOpen, setUpdateSongModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false); // Trạng thái "Yêu thích"
  const [tracks, setTracks] = useState([]);
  const token = Cookies.get("token");
  if (!token) throw new Error("Token not found");
  console.log(token);

  const userId = jwtDecode(token).identifier;

  useEffect(() => {
    if (!info.duration) {
      const sound = new Howl({
        src: [info.track],
        html5: true,
      });

      sound.on("load", () => {
        setDuration(sound.duration());
        sound.unload();
      });
    }
  }, [info]);

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const response = await makeAuthenticatedGETRequest(
          `/song/get/check-like/${info._id}`
        );

        // Kiểm tra xem response có phải là JSON hợp lệ không
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server không trả về JSON.");
        }

        const data = await response.json();
        console.log("Like status:", data);

        // Kiểm tra xem likedBy có chứa userId của người dùng hiện tại không
        const isLiked = data.likedBy && data.likedBy.includes(userId);
        console.log(data.likedBy.includes(userId));
        setIsLiked(isLiked);
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    if (info._id) {
      checkLikeStatus();
    }
  }, [info._id, userId]);

  const formattedDuration = duration ? formatDuration(duration) : "Loading...";

  const handleLike = async (trackId, isLiked) => {
    trackId = info._id;
    try {
      const endpoint = isLiked
        ? `/song/put/unlike/${trackId}`
        : `/song/put/like/${trackId}`;
      const response = await makeAuthenticatedPUTRequest(endpoint);
      setIsLiked(true);

      // Update the UI or state with the new data
      setTracks((prevTracks) =>
        prevTracks.map((track) =>
          track.id === trackId ? { ...track, ...response } : track
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Function to handle sharing
  const handleShare = () => {
    const shareData = {
      title: info.name,
      text: `Check out this awesome song by ${info.artist.username}!`,
      url: window.location.href, // Use the current page URL, or you can provide a specific song URL
    };

    if (navigator.share) {
      // For devices that support the Share API (mainly mobile)
      navigator
        .share(shareData)
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.log("Error sharing", error));
    } else {
      // Fallback: Open share in a new window (for desktops or unsupported devices)
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareData.url
      )}`;
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  // Handle adding song to playlist
  const handleAddToPlaylist = () => {
    setAddToPlaylistModalOpen(true); // Open the add to playlist modal
    setMenuOpen(false); // Close the dropdown menu
  };

  const handleUpdate = () => {
    setUpdateSongModalOpen(true);
    setMenuOpen(false);
  };

  return (
    <Box
      className="flex items-center p-4 hover:bg-gray-700 rounded-xl transition duration-200 ease-in-out relative group 
  sm:h-32 md:h-36 lg:h-40"
      onClick={() => setCurrentSong(info)}
      boxShadow="0 8px 20px rgba(0, 0, 0, 0.4)"
      color={useColorModeValue("black", "white")}
    >
      <div
        className="relative"
        onClick={(e) => {
          e.stopPropagation();
          onPlay();
        }}
      >
        <div
          className="w-16 h-16 bg-cover bg-center rounded-md"
          style={{
            backgroundImage: `url(${info.thumbnail})`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
        ></div>
        <button
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          aria-label={`Play ${info.name}`}
        >
          <PlayCircle className="w-8 h-8 text-white" />
        </button>
      </div>

      <div className="flex flex-col justify-center pl-4 flex-grow min-w-0">
        <div
          className="text-lg font-semibold text-white truncate hover:underline"
          style={{
            color: useColorModeValue("black", "white"), // Thay đổi màu chữ
          }}
        >
          {info.name}
        </div>
        <div
          className="text-sm  truncate hover:underline"
          style={{
            color: useColorModeValue("text-gray-400", "white"), // Thay đổi màu chữ
          }}
        >
          {info.artist ? info.artist.username : "Unknown Artist"}
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto relative">
        <div className="text-md text-gray-400">{formattedDuration}</div>
        <button
          className={`text-gray-400 hover:text-pink-500 transition-colors duration-200 relative flex items-center gap-2 ${
            isLiked ? "text-pink-500" : ""
          }`}
          onClick={handleLike}
          aria-label={`Like ${info.name}`}
        >
          <Heart className="w-5 h-5" />
          <span>{info.likes}</span>
          <span>{isLiked ? "Liked" : "Like"}</span>
        </button>

        <button
          className="text-gray-400 hover:text-white transition-colors duration-200 relative"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          aria-label="More options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div
            className="absolute right-0 top-full mt-2 bg-gray-800 text-white rounded shadow-lg z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <ul>
              <li
                className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                onClick={handleAddToPlaylist} // Open the add to playlist modal
              >
                Add to Playlist
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  setModalOpen(true); // Open modal for download
                  setMenuOpen(false);
                }}
              >
                Download
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                onClick={handleUpdate}
              >
                Update
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                onClick={handleShare}
              >
                Share
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Modal for Download */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 text-white p-8 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Download {info.name}</h2>
            <p className="text-sm mb-4">Do you want to download this song?</p>
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              onClick={() => {
                downloadFile(info.track, info.name);
                setModalOpen(false); // Close the modal after download
                console.log(`Downloading ${info.name}`);
              }}
            >
              Download
            </button>
            <button
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded ml-4"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add to Playlist Modal */}
      {addToPlaylistModalOpen && (
        <AddToPlaylistModal
          closeModal={() => setAddToPlaylistModalOpen(false)}
          addSongToPlaylist={(playlistId) => {
            console.log(`Added song to playlist ${playlistId}`);
            setAddToPlaylistModalOpen(false);
          }}
          songId={info._id}
        />
      )}
      {updateSongModalOpen && (
        <UpdateSongModal
          closeModal={() => setUpdateSongModalOpen(false)}
          isOpen={updateSongModalOpen}
          song={info}
        />
      )}
    </Box>
  );
};

export default SingleSongCard;
