import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import LoggedInContainer from "../containers/LoggedInContainer";
import PlaylistView from "../components/PlaylistView/PlaylistView";
import UserView from "../components/UserView";
import HomeSlider from "../components/HomeSlider";
import SingleSongCard from "@/components/Card/SingleSongCard";
import { makeAuthenticatedGETRequest } from "@/utils/serverHelper";
import SongController from "@/controller/SongController";
import SongContext from "@/components/SongContext";

// Constants for genre filter options
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

const LoggedInHomePage = () => {
  const { soundPlayed, setSoundPlayed, isPaused, setIsPaused } =
    useContext(SongContext);
  const [currentSound, setCurrentSound] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);

  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // Thời gian hiện tại
  const [duration, setDuration] = useState(() => {
    // Lấy duration từ localStorage nếu có
    return parseFloat(localStorage.getItem("songDuration") || 0);
  });
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

    return () => clearInterval(interval); // Dọn dẹp khi component unmount hoặc soundPlayed thay đổi
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
    // Tạo một đối tượng Howl mới và phát bài hát mới
    const sound = new Howl({
      src: [songSrc],
      html5: true,
      volume: finalVolume,
      onplay: () => {
        setDuration(sound.duration()); // Đặt thời gian tổng khi bài hát bắt đầu
        updateCurrentTime(); // Bắt đầu cập nhật thời gian hiện tại
      },
      onend: () => {
        setCurrentTime(0); // Đặt lại thời gian khi bài hát kết thúc
      },
    });

    setSoundPlayed(sound); // Lưu sound vào state
    sound.play(); // Phát bài hát
    setIsPaused(false); // Bài hát đang phát, không tạm dừng
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
  const [songData, setSongData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState("all");

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await makeAuthenticatedGETRequest(
          "/song/get/allsongs"
        );
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
    const song = songData.find((song) => song._id === songId._id);
    console.log("Song data:", songId);
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
    });
    newSound.play();
    setSoundPlayed(newSound);
  };
  useEffect(() => {
    return () => {
      if (currentSound) {
        currentSound.stop();
        currentSound.unload();
      }
    };
  }, [currentSound]);
  const handleMoreOptions = (songId) => {
    console.log(`More options for song with id: ${songId}`);
    // Add your more options logic here
  };

  const filteredSongs = songData.filter((song) => {
    if (filterCriteria === "all") return true;
    return song.genre === filterCriteria;
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
      <HomeSlider />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-white text-2xl font-semibold">All Songs</h1>

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

        <div className="space-y-8 mt-12">
          <PlaylistView titleText="Rock" genre={"rock"} />
          <PlaylistView titleText="Jazz" genre={"jazz"} />
          <PlaylistView titleText="Pop" genre={"pop"} />
          <PlaylistView titleText="Classical" genre={"classical"} />
          <PlaylistView titleText="Hip-Hop" genre={"hiphop"} />
          <PlaylistView titleText="Beat" genre={"beat"} />
          <UserView titleText="Artists you maybe know" />
        </div>
      </div>
      <div className="h-24" /> {/* Spacer for bottom content */}
    </LoggedInContainer>
  );
};

export default LoggedInHomePage;
