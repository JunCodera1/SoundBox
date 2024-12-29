import React, { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import SingleSongCard from "../components/Card/SingleSongCard";
import { Howl } from "howler";
import { makeAuthenticatedGETRequest } from "../utils/serverHelper";
import LoggedInContainer from "@/containers/LoggedInContainer";

const menuItemsLeft = [
  { label: "Home", uri: "/" },
  { label: "Feed", uri: "/feed" },
  { label: "Trending", uri: "/trending" },
  { label: "Upload", uri: "/upload" },
];

const GENRE_OPTIONS = [
  { value: "all", label: "All Genres" },
  { value: "pop", label: "Pop" },
  { value: "rock", label: "Rock" },
  { value: "jazz", label: "Jazz" },
  { value: "classical", label: "Classical" },
  { value: "hiphop", label: "Hip-Hop" },
  { value: "beat", label: "Beat" },
  { value: "chill", label: "Chill" },
];

const SongPage = () => {
  const [songData, setSongData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState("all"); // Tiêu chí lọc
  const [soundPlayed, setSoundPlayed] = useState(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setIsLoading(true);
        const response = await makeAuthenticatedGETRequest("/song/get/mysongs");
        setSongData(response.data);
      } catch (err) {
        setError("Failed to fetch songs. Please try again later.");
        console.error("Error fetching songs:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const handlePlay = (songId) => {
    const song = songData.find((song) => song._id === songId);
    if (!song || !song.url) {
      console.error("Invalid song URL");
      return;
    }

    // Stop currently playing sound
    if (soundPlayed) {
      soundPlayed.stop();
    }

    // Play the selected song
    const newSound = new Howl({
      src: [song.url],
      html5: true,
    });
    newSound.play();
    setSoundPlayed(newSound);
  };

  const handleMoreOptions = (songId) => {
    console.log(`More options for song with id: ${songId}`);
    // Add your more options logic here
  };

  const filteredSongs = songData.filter((song) => {
    if (filterCriteria === "all") {
      return true; // Hiển thị tất cả bài hát
    }
    return song.genre === filterCriteria; // Giả sử bạn có trường `genre` trong dữ liệu bài hát
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-500 bg-red-100/10 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      );
    }

    if (filteredSongs.length === 0) {
      return (
        <div className="text-white bg-gray-800/50 p-6 rounded-lg text-center">
          <p>No songs found for the selected genre.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredSongs.map((song) => (
          <SingleSongCard
            key={song._id}
            info={song}
            onPlay={() => handlePlay(song._id)}
            onMoreOptions={() => handleMoreOptions(song._id)}
          />
        ))}
      </div>
    );
  };

  return (
    <LoggedInContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-white text-2xl font-semibold">
            My Uploaded Songs
          </h1>

          <div className="relative">
            <select
              value={filterCriteria}
              onChange={(e) => setFilterCriteria(e.target.value)}
              className="appearance-none bg-gray-800 text-white px-4 py-2 pr-8 rounded-lg border border-gray-700 hover:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 focus:outline-none min-w-[160px]"
            >
              {GENRE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {renderContent()}
      </div>
    </LoggedInContainer>
  );
};

export default SongPage;
