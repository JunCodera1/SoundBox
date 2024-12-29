import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Text, Stack, Spinner } from "@chakra-ui/react";
import LoggedInContainer from "@/containers/LoggedInContainer";
import { makeAuthenticatedGETRequest } from "@/utils/serverHelper";
import SingleSongCard from "@/components/Card/SingleSongCard";

const PlaylistDetails = () => {
  const { playlistId } = useParams(); // Lấy ID playlist từ URL
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]); // State để lưu danh sách bài hát chi tiết
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getPlaylistDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `/playlist/get/playlist/${playlistId}`; // URL API playlist
        const response = await makeAuthenticatedGETRequest(url);
        console.log("Playlist response:", response);
        setPlaylist(response);

        // Fetch chi tiết các bài hát từ playlist
        if (response.songs && response.songs.length > 0) {
          const songDetails = await Promise.allSettled(
            response.songs.map((songId) =>
              makeAuthenticatedGETRequest(`/song/get/mysongs/${songId}`)
            )
          );

          // Lọc các kết quả thành công
          const validSongs = songDetails
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value);

          setSongs(validSongs);
        }
      } catch (error) {
        console.error("Error fetching playlist or songs:", error);
        setError("Failed to load playlist details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    getPlaylistDetails(); // Gọi hàm khi component render
  }, [playlistId]);

  if (loading) {
    return (
      <LoggedInContainer curActiveScreen={"library"}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <Spinner size="xl" color="white" />
        </Box>
      </LoggedInContainer>
    );
  }

  if (error) {
    return (
      <LoggedInContainer curActiveScreen={"library"}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <Text color="red.500" fontSize="lg">
            {error}
          </Text>
        </Box>
      </LoggedInContainer>
    );
  }

  return (
    <LoggedInContainer curActiveScreen={"library"}>
      <Box pt={8}>
        <Text fontSize="2xl" fontWeight="semibold" color="white">
          {playlist.name}
        </Text>
        <Text color="gray.400" mt={2}>
          {playlist.desc || "No description available"}
        </Text>
        <Stack spacing={4} pt={10}>
          {songs.length > 0 ? (
            songs.map((song) => (
              <SingleSongCard key={song._id} info={song} onPlay={() => {}} />
            ))
          ) : (
            <Text color="white">No songs in this playlist</Text>
          )}
        </Stack>
      </Box>
    </LoggedInContainer>
  );
};

export default PlaylistDetails;
