import React, { useState, useEffect } from "react";
import SingleSongCard from "./SingleSongCard"; // Component to display song
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons"; // Dropdown icon
import EditPlaylistModal from "../../modals/EditPlaylistModal"; // Edit Playlist modal component
import { makeAuthenticatedGETRequest } from "@/utils/serverHelper"; // API helper function
import axios from "axios";

const SinglePlaylistCard = ({ playlist }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [songs, setSongs] = useState([]); // Song list
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  // Open and close modal
  const openEditModal = () => setShowEditModal(true);
  const closeEditModal = () => {
    setShowEditModal(false);
    setError(null); // Reset error when modal closes
  };

  // Fetch song details when playlist changes
  useEffect(() => {
    if (playlist.songs && playlist.songs.length > 0) {
      const fetchSongs = async () => {
        setLoading(true); // Start loading
        setError(null); // Reset error at the start of the API call

        try {
          const songDetails = await Promise.allSettled(
            playlist.songs.map((songId) => {
              if (songId) {
                return makeAuthenticatedGETRequest(
                  `/song/get/mysongs/${songId}`
                );
              }
            })
          );

          const validSongs = songDetails
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value);
          setSongs(validSongs);
        } catch (error) {
          setError("Failed to load songs. Please try again later.");
          console.error("Error fetching song details:", error);
        } finally {
          setLoading(false); // End loading
        }
      };

      fetchSongs();
    }
  }, [playlist.songs]);

  return (
    <div className="playlist-card bg-gray-800 p-4 rounded-lg">
      {/* Playlist header */}
      <div className="playlist-header flex justify-between items-center">
        <div className="playlist-name text-white text-xl font-semibold">
          {playlist.name || "Untitled Playlist"}
        </div>

        {/* Dropdown menu for actions */}
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            colorScheme="blue"
          >
            More
          </MenuButton>
          <MenuList>
            <MenuItem onClick={openEditModal}>Edit Playlist</MenuItem>
            {/* You can add delete functionality here */}
          </MenuList>
        </Menu>
      </div>

      {/* Playlist description */}
      <div className="playlist-desc text-gray-400 mt-2">
        {playlist.desc || "No description available"}
      </div>

      {/* Song list */}
      <div className="songs-list pt-5">
        {loading ? (
          <Spinner size="xl" color="blue.500" />
        ) : error ? (
          <div className="text-white">{error}</div>
        ) : songs.length > 0 ? (
          songs.map((song) => (
            <SingleSongCard
              key={song._id} // Sử dụng id hoặc giá trị duy nhất từ đối tượng `song`
              info={song}
              onPlay={() => {}}
            />
          ))
        ) : (
          <div className="text-white">No songs in this playlist</div>
        )}
      </div>

      {/* Edit Playlist modal */}
      <EditPlaylistModal
        isOpen={showEditModal}
        closeModal={closeEditModal}
        playlist={playlist} // Pass playlist data to modal
      />
    </div>
  );
};

export default SinglePlaylistCard;
