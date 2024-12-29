import { useState, useEffect } from "react";
import {
  Input,
  Button,
  Box,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  useToast,
  Select,
} from "@chakra-ui/react";
import { makeAuthenticatedPUTRequest } from "../utils/serverHelper";

const UpdateSongModal = ({ closeModal, isOpen, song, onUpdateSuccess }) => {
  const [songName, setSongName] = useState("");
  const [songThumbnail, setSongThumbnail] = useState("");
  const [songGenre, setSongGenre] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  useEffect(() => {
    console.log("Song in UpdateSongModal:", song);
    if (song && isOpen) {
      setSongName(song.name || "");
      setSongThumbnail(song.thumbnail || "");
      setSongGenre(song.genre || "");
      setErrors({}); // Clear any previous errors
    }
  }, [song, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!songName.trim()) {
      newErrors.name = "Song name is required";
    }

    if (songThumbnail && !isValidUrl(songThumbnail)) {
      newErrors.thumbnail = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleClose = () => {
    setErrors({});
    closeModal();
  };

  const updateSong = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const data = {
      name: songName.trim(),
      thumbnail: songThumbnail.trim(),
      genre: songGenre.trim(),
    };

    try {
      const response = await makeAuthenticatedPUTRequest(
        `/song/put/${song._id}`,
        data
      );

      toast({
        title: "Success",
        description: "Song updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (onUpdateSuccess) {
        onUpdateSuccess(response);
      }

      handleClose();
    } catch (error) {
      console.error("Error updating song:", error);
      toast({
        title: "Error",
        description: "Failed to update song. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent bg="appBlack" color="white" p={8}>
        <ModalHeader>Edit Song</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box mb={4}>
            <FormControl isRequired isInvalid={!!errors.name}>
              <FormLabel>Name</FormLabel>
              <Input
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                placeholder="Song Name"
                bg="gray.700"
                color="white"
              />
              {errors.name && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.name}
                </Text>
              )}
            </FormControl>
          </Box>
          <Box mb={4}>
            <FormControl isInvalid={!!errors.thumbnail}>
              <FormLabel>Thumbnail</FormLabel>
              <Input
                value={songThumbnail}
                onChange={(e) => setSongThumbnail(e.target.value)}
                placeholder="Song Thumbnail URL"
                bg="gray.700"
                color="white"
              />
              {errors.thumbnail && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.thumbnail}
                </Text>
              )}
            </FormControl>
          </Box>
          <Box mb={4}>
            <FormControl>
              <FormLabel>Genre</FormLabel>
              <Select
                placeholder="Select genre"
                value={songGenre}
                onChange={(e) => setSongGenre(e.target.value)}
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
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            onClick={updateSong}
            isLoading={loading}
            loadingText="Saving..."
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateSongModal;
