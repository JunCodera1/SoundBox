import {
  Box,
  Text,
  useColorModeValue,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import React, { useState, useEffect, useContext, useRef } from "react";
import Card from "./Card";
import { makeAuthenticatedGETRequest } from "@/utils/serverHelper";
import { Howl } from "howler";
import SongController from "@/controller/SongController";
import SongContext from "../SongContext";

const PlaylistView = ({ titleText, genre }) => {
  const {
    soundPlayed,
    setSoundPlayed,
    isPaused,
    setIsPaused,
    currentSong,
    setCurrentSong,
    currentSound,
    setCurrentSound,
  } = useContext(SongContext);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // Thời gian hiện tại
  const [duration, setDuration] = useState(0);
  const replaySong = () => {
    if (soundPlayed) {
      soundPlayed.stop(); // Stop the current song
      soundPlayed.seek(0); // Reset the current time to 0
      soundPlayed.play(); // Start playing the song from the beginning
    }
    setCurrentSong(currentSong); // This is to ensure that the current song state is set again (in case any state update is needed)
  };

  // Tính toán finalVolume với chế độ mute
  const finalVolume = muted ? 0 : volume;

  const firstUpdate = useRef(true);
  const currentTimeRef = useRef(0);
  const [songData, setSongData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const changeSong = (songSrc) => {
    if (soundPlayed) {
      soundPlayed.stop(); // Dừng bài nhạc hiện tại
      soundPlayed.unload(); // Giải phóng tài nguyên
    }

    const newSound = new Howl({
      src: [songSrc],
      html5: true,
      onload: () => {
        // Lấy duration của bài hát sau khi tải xong
        setDuration(newSound.duration());
      },
    });

    setSoundPlayed(newSound);
    newSound.play();
  };

  const playSound = () => {
    if (soundPlayed) {
      soundPlayed.play();
    }
  };

  const pauseSound = () => {
    if (soundPlayed) {
      soundPlayed.pause();
    }
  };

  const togglePlayPause = () => {
    if (isPaused) {
      playSound();
      setIsPaused(false);
    } else {
      pauseSound();
      setIsPaused(true);
    }
  };
  // Fetch songs data when the component mounts or genre changes
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setIsLoading(true);
        const response = await makeAuthenticatedGETRequest(
          `/song/get/genre/${genre}`
        );
        // Properly handle the API response structure
        setSongData(response.data || []); // Access the data property from response
      } catch (err) {
        console.error("Error fetching songs:", err);
        console.error("Error response:", err.response);
        setError("Failed to load songs. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, [genre]); // Add genre as dependency

  // Cleanup function for audio resources
  useEffect(() => {
    return () => {
      if (currentSound) {
        currentSound.stop();
        currentSound.unload();
      }
    };
  }, [currentSound]);

  // Handle play event when a song card is clicked
  const handlePlay = (song) => {
    if (!song || !song.track) {
      console.error("Invalid song URL");
      return;
    }

    // Stop currently playing sound
    if (soundPlayed) {
      soundPlayed.stop();
    }

    // Play the selected song
    const newSound = new Howl({
      src: [song.track],
      html5: true,
      volume: finalVolume,
      onplay: () => {
        setDuration(newSound.duration());
        setCurrentTime(0); // Reset thời gian
      },
    });

    newSound.play();
    setSoundPlayed(newSound);
    setCurrentSong(song); // Cập nhật bài hát hiện tại
    setIsPlaying(true); // Đánh dấu bài hát đang phát
  };

  return (
    <Box color="white" mt="8" ml="5">
      {/* Title */}
      <Box
        p="5"
        fontFamily="semibold"
        color={useColorModeValue("black", "gray.200")}
        mb="5"
      >
        <Text fontSize="2xl" fontWeight="semibold">
          {titleText}
        </Text>
      </Box>

      <Box overflowX="auto" ml="5">
        <HStack spacing="4" align="start">
          {isLoading ? (
            <Spinner size="lg" color="blue.500" />
          ) : error ? (
            <Text color="red.500">{error}</Text>
          ) : songData.length === 0 ? (
            <Text>No songs available for this genre</Text>
          ) : (
            songData.map((song) => (
              <Box width="300px" key={song._id}>
                <Card
                  artist={song.artist.username}
                  title={song.name}
                  imgUrl={song.thumbnail}
                  isPlaying={currentSong?._id === song._id && isPlaying}
                  onClick={() => handlePlay(song)}
                />
              </Box>
            ))
          )}
          {currentSong && (
            <SongController
              currentSong={currentSong}
              currentTime={currentTime}
              duration={duration}
              soundPlayed={soundPlayed}
              isPaused={isPaused}
              togglePlayPause={togglePlayPause}
              replaySong={replaySong}
              muted={muted}
              setMuted={setMuted}
              volume={volume}
              setVolume={setVolume}
            />
          )}
        </HStack>
      </Box>
    </Box>
  );
};

export default PlaylistView;
