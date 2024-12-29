import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { makeAuthenticatedPOSTRequest } from "../utils/serverHelper";

const CreatePlaylistModal = ({ isOpen, closeModal }) => {
  const [playlistName, setPlaylistName] = useState("");
  const [playlistThumbnail, setPlaylistThumbnail] = useState("");
  const [description, setDescription] = useState(""); // State for description
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  const createPlaylist = async () => {
    setLoading(true);
    setError(""); // Reset previous errors
    setSuccess(false); // Reset success state

    try {
      const response = await makeAuthenticatedPOSTRequest("/playlist/create", {
        name: playlistName,
        thumbnail: playlistThumbnail,
        description,
        songs: [],
      });
      console.log(response);
      if (response) {
        setSuccess(true); // Playlist created successfully
        toast({
          title: "Playlist created.",
          description: "Your playlist was successfully created.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        closeModal(); // Close modal after success
      } else {
        setError("Failed to create playlist. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while creating the playlist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create a New Playlist</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {success && (
            <div className="text-green-500 mb-4">
              Playlist created successfully!
            </div>
          )}

          <FormControl id="playlistName" isRequired isInvalid={error}>
            <FormLabel>Playlist Name</FormLabel>
            <Input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Enter playlist name"
            />
            <FormErrorMessage>{error}</FormErrorMessage>
          </FormControl>

          <FormControl id="thumbnail" mt={4}>
            <FormLabel>Thumbnail URL</FormLabel>
            <Input
              type="text"
              value={playlistThumbnail}
              onChange={(e) => setPlaylistThumbnail(e.target.value)}
              placeholder="Enter thumbnail URL"
            />
          </FormControl>

          <FormControl id="desc" mt={4}>
            <FormLabel>Description (Optional)</FormLabel>
            <Textarea
              value={description} // Controlled by description state
              onChange={(e) => setDescription(e.target.value)} // Update state on input
              placeholder="Enter description (optional)"
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="blue"
            onClick={createPlaylist}
            isLoading={loading}
            loadingText="Creating"
            isDisabled={loading}
          >
            Create Playlist
          </Button>
          <Button variant="ghost" onClick={closeModal}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreatePlaylistModal;
