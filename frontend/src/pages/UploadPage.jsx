import React, { useState } from "react";
import Layout from "../components/Layout";
import TextInput from "../components/TextInput";
import {
  Box,
  Heading,
  Text,
  VStack,
  Icon,
  Flex,
  FormControl,
  FormLabel,
  Button,
  useColorModeValue,
  Select,
} from "@chakra-ui/react";
import { FaCloudUploadAlt } from "react-icons/fa";
import CloudinaryUpload from "../components/CloudinaryUpload";
import { makeAuthenticatedPOSTRequest } from "../utils/serverHelper";
import { useNavigate } from "react-router-dom";
import LoggedInContainer from "@/containers/LoggedInContainer";
import axios from "axios";

const UploadPage = () => {
  const [artist, setArtist] = useState("");
  const [thumbnailURL, setThumbnailURL] = useState("");
  const [musicName, setMusicName] = useState("");
  const [genre, setGenre] = useState("");
  const [playlistURL, setPlaylistURL] = useState("");
  const [errors, setErrors] = useState({});
  const [uploadedSongFileName, setUploadedSongFileName] = useState("");
  const navigate = useNavigate();

  const validateFields = () => {
    let isValid = true;
    const errorMessages = {};

    if (!musicName.trim()) {
      isValid = false;
      errorMessages.musicName = "Music name is required.";
    }

    if (!genre.trim()) {
      isValid = false;
      errorMessages.genre = "Genre is required.";
    }

    if (!playlistURL.trim()) {
      isValid = false;
      errorMessages.playlistURL = "Playlist URL is required.";
    }

    setErrors(errorMessages);
    return isValid;
  };

  const submitSong = async () => {
    if (validateFields()) {
      const data = {
        thumbnail: thumbnailURL,
        name: musicName,
        genre: genre,
        track: playlistURL,
      };

      try {
        const result = await makeAuthenticatedPOSTRequest("/song/create", data);

        if (result) {
          alert("Song created successfully!", result.data);
        } else {
          console.error("Error creating song:", result.status);
          throw new Error("Error creating song");
        }
      } catch (error) {
        alert(error.message);
      }
    } else {
      alert("Please fill in all required fields correctly.");
    }
  };

  const handleFileUploadSuccess = (url, filename) => {
    setPlaylistURL(url);
    setUploadedSongFileName(filename);
  };

  return (
    <LoggedInContainer>
      <Box maxW="1400px" mx="auto" py={1}>
        <Flex
          direction={{ base: "column", md: "row" }}
          align="flex-start"
          justify="space-between"
          gap={8}
          boxSizing="border-box"
          mx="auto"
          px={{ base: 4, md: 6 }}
          w={"full"}
        >
          <Box
            flex="1"
            minW={{ base: "100%", md: "50%" }}
            mb={{ base: 8, md: 0 }}
          >
            <Heading size="md" mb={4}>
              Song profile
            </Heading>
            <VStack spacing={4} align="stretch">
              <FormControl id="thumbnail">
                <FormLabel>Thumbnail</FormLabel>
                <TextInput
                  placeholder={"Enter thumbnail"}
                  value={thumbnailURL}
                  setValue={setThumbnailURL}
                  error={errors.thumbnail}
                />
              </FormControl>

              <FormControl id="musicName">
                <FormLabel>Music name</FormLabel>
                <TextInput
                  placeholder="Enter music name"
                  value={musicName}
                  setValue={setMusicName}
                  error={errors.musicName}
                />
              </FormControl>

              <FormControl id="playlistURL">
                <FormLabel>Playlist URL</FormLabel>
                <TextInput
                  placeholder="Enter playlist URL"
                  value={playlistURL}
                  setValue={setPlaylistURL}
                  error={errors.playlistURL}
                />
              </FormControl>

              <FormControl id="genre">
                <FormLabel>Genre</FormLabel>
                <Select
                  placeholder="Select genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                >
                  <option value="pop">Pop</option>
                  <option value="rock">Rock</option>
                  <option value="jazz">Jazz</option>
                  <option value="classical">Classical</option>
                  <option value="hiphop">Hip-Hop</option>
                  <option value="beat">Beat</option>
                  <option value="chill">Chill</option>
                  {/* Thêm các thể loại khác nếu cần */}
                </Select>
              </FormControl>

              <Box display="flex" justifyContent="center" mt={"0"}>
                <Button colorScheme="teal" onClick={submitSong} size="lg">
                  Submit Song
                </Button>
              </Box>
            </VStack>
          </Box>

          <Box
            flex="1"
            border="1px solid"
            borderColor="gray.300"
            borderRadius="md"
            p={6}
            minH={"auto"}
            w={{ base: "100%", md: "50%" }}
          >
            <Heading size="lg" mb={2}>
              Upload your audio files.
            </Heading>
            <Text mb={4}>
              For optimal quality, use WAV, FLAC, AIFF, or ALAC formats. The
              maximum file size is 4 GB uncompressed.
            </Text>

            <Box
              border="1px dashed"
              borderColor="gray.300"
              py={10}
              borderRadius="md"
              bg="white"
              textAlign="center"
              onDragOver={(e) => e.preventDefault()}
            >
              <Icon
                as={FaCloudUploadAlt}
                boxSize={12}
                color="teal.500"
                mb={4}
              />
              <br />
              <CloudinaryUpload
                setUrl={handleFileUploadSuccess}
                setName={setUploadedSongFileName}
              />
              <br />

              <div>
                {uploadedSongFileName ? (
                  <Box
                    bg="green.500"
                    rounded="full"
                    p={3}
                    w="1/3"
                    textAlign="center"
                  >
                    {uploadedSongFileName.length > 35 ? (
                      <>
                        {uploadedSongFileName.substring(0, 35)}...
                        <br />
                      </>
                    ) : (
                      uploadedSongFileName
                    )}
                  </Box>
                ) : (
                  <Text color={"black"}>No file uploaded yet</Text>
                )}
              </div>

              <input
                id="fileInput"
                type="file"
                style={{ display: "none" }}
                accept=".wav,.flac,.aiff,.alac"
              />
            </Box>
          </Box>
        </Flex>
      </Box>
    </LoggedInContainer>
  );
};

export default UploadPage;
