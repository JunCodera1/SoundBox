import React, {
  useContext,
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
} from "react";
import Sidebar from "../components/Sidebar";
import { Box, Image, useColorModeValue } from "@chakra-ui/react";
import image from "../assets/Pictures/0c1f51cf62b4a54f6b80e5a29224390f-removebg-preview.png";
import PlaylistView from "../components/PlaylistView/PlaylistView";
import { Howl, Howler } from "howler";
import Navbar from "../components/Navbar";
import { FaShuffle } from "react-icons/fa6";
import { MdOutlineSkipPrevious } from "react-icons/md";
import { MdOutlineSkipNext } from "react-icons/md";
import { FaCirclePause } from "react-icons/fa6";
import { FaRepeat } from "react-icons/fa6";
import { FaPauseCircle, FaPlayCircle } from "react-icons/fa";
import SongContext from "@/components/SongContext";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa"; // I
import { Slider } from "@/components/ui/slider";
import ShuffleIcon from "@/assets/icons/shuffle.svg";
import RedoIcon from "@/assets/icons/redo.svg";
import SongController from "@/controller/SongController";

const menuItemsLeft = [
  { label: "Home", uri: "/" },
  { label: "Feed", uri: "/feed" },
  { label: "Trending", uri: "/trending" },
  { label: "Upload", uri: "/upload" },
  { label: "Premium", uri: "/payment" },
  { label: "Store", uri: "/store" },
];

const LoggedInContainer = ({ children }) => {
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (soundPlayed && soundPlayed.playing()) {
        const currentSeek = soundPlayed.seek();
        currentTimeRef.current = currentSeek; // Lưu giá trị vào ref
        setCurrentTime(currentSeek); // Cập nhật state
      }
    }, 1000); // Cập nhật mỗi giây

    return () => clearInterval(interval);
  }, [soundPlayed]);

  useLayoutEffect(() => {
    // Prevent first render logic
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    // Chỉ thay đổi bài hát nếu có bài hát mới
    if (
      currentSong &&
      (!soundPlayed || soundPlayed._src !== currentSong.track)
    ) {
      if (soundPlayed && soundPlayed.playing()) {
        soundPlayed.stop(); // Dừng bài hát cũ nếu đang phát
      }

      changeSong(currentSong.track);
    } else if (soundPlayed) {
      // Nếu bài hát giống bài hát cũ, chỉ thay đổi âm lượng
      soundPlayed.volume(finalVolume);
    }
  }, [currentSong, finalVolume]); // Trigger khi currentSong hoặc volume thay đổi

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

  useEffect(() => {
    // Lưu duration vào localStorage khi nó thay đổi
    if (duration) {
      localStorage.setItem("songDuration", duration);
    }
  }, [duration]);

  // Cập nhật thời gian hiện tại mỗi 100ms
  const updateCurrentTime = () => {
    if (soundPlayed && soundPlayed.playing()) {
      const currentSeek = soundPlayed.seek();
      if (currentSeek !== currentTimeRef.current) {
        setCurrentTime(currentSeek); // Chỉ cập nhật khi giá trị thay đổi
        currentTimeRef.current = currentSeek; // Cập nhật giá trị trong ref
      }
    }
    requestAnimationFrame(updateCurrentTime); // Gọi lại chính nó
  };

  // Bắt đầu cập nhật khi bài hát bắt đầu phát
  useEffect(() => {
    if (soundPlayed && soundPlayed.playing()) {
      updateCurrentTime(); // Gọi hàm ngay khi bài hát bắt đầu
    }
  }, [soundPlayed]); // Chỉ gọi lại khi soundPlayed thay đổi

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <Box className="w-full min-h-screen flex flex-col">
      <Navbar menuItemsLeft={menuItemsLeft} />
      <Box className="flex flex-1 relative gap-4">
        <Box
          width={{ base: "70px", md: "250px" }}
          bg={useColorModeValue("gray.100", "gray.800")}
          className="flex-shrink-0"
        >
          <Sidebar />
        </Box>
        <Box className="flex-1 flex flex-col overflow-y-auto">
          <Box p={4}>{children}</Box>
        </Box>
      </Box>
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
    </Box>
  );
};

export default LoggedInContainer;
