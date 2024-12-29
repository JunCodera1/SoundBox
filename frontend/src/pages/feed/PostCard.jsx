import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Heading,
  Image,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import {
  FaHeart,
  FaShare,
  FaComment,
  FaPaperclip,
  FaPlay,
} from "react-icons/fa";
import {
  makeAuthenticatedGETRequest,
  makeAuthenticatedPOSTRequest,
} from "@/utils/serverHelper";

export default function PostCard({ post }) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [track, setTrack] = useState(null);
  const [authorDetails, setAuthorDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentUsers, setCommentUsers] = useState({});

  // Fetch track details based on the track URL from the post
  useEffect(() => {
    if (post.trackUrl) {
      const fetchTrack = async () => {
        try {
          const encodedUrl = encodeURIComponent(post.trackUrl);
          const response = await makeAuthenticatedGETRequest(
            `/post/get/song/${encodedUrl}`
          );
          setTrack(response);
        } catch (error) {
          console.error("Error fetching track:", error);
        }
      };
      fetchTrack();
    }
  }, [post.trackUrl]);

  // Fetch post author details
  useEffect(() => {
    if (post.author) {
      const fetchAuthorDetails = async () => {
        try {
          const response = await makeAuthenticatedGETRequest(
            `/user/get/users/${post.author}`
          );
          setAuthorDetails(response);
        } catch (error) {
          console.error("Error fetching author details:", error);
        }
      };

      fetchAuthorDetails();
    }
  }, [post.author]);

  // Fetch comments based on postId and update state with user details
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await makeAuthenticatedGETRequest(
          `/post/get/comments/${post._id}`
        );
        console.log("Comments:", response);
        setComments(response);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setComments([]);
      }
    };

    fetchComments();
  }, [post._id]);

  // Fetch users' details for the comments
  useEffect(() => {
    const fetchCommentUsers = async () => {
      if (comments.length > 0) {
        try {
          const commentUserPromises = comments.map(async (comment) => {
            const response = await makeAuthenticatedGETRequest(
              `/user/get/users/${comment.user}`
            );
            return {
              id: comment.user,
              name: response.name,
              profilePicture: response.profilePicture,
            };
          });

          const commentUsersData = await Promise.all(commentUserPromises);
          const userMap = commentUsersData.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
          }, {});

          setCommentUsers(userMap);
        } catch (error) {
          console.error("Error fetching user details for comments:", error);
        }
      }
    };

    fetchCommentUsers();
  }, [comments]);
  console.log("Comment Users:", commentUsers);

  const handleAttachment = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const payload = {
      comment,
      attachment: attachment ? attachment : null,
    };

    try {
      const response = await makeAuthenticatedPOSTRequest(
        `/post/${post._id}/comments`,
        payload
      );
      setComments([response, ...comments]);
      setComment("");
      setAttachment(null);
      setIsCommenting(false);
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  return (
    <Card maxW="8xl" marginBottom="80px" mx="auto">
      <CardHeader>
        <Flex alignItems="center" gap={4}>
          <Image
            borderRadius="full"
            boxSize="40px"
            src={authorDetails?.avatar || "https://via.placeholder.com/40"}
            alt={authorDetails?.username || "Unknown"}
            fallbackSrc="https://via.placeholder.com/40"
          />
          <Box>
            <Heading size="md">{authorDetails?.username || "Unknown"}</Heading>
            <Text fontSize="sm" color="gray.500">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </Text>
          </Box>
        </Flex>
      </CardHeader>
      {post.thumbnailUrl && (
        <Image
          src={post.thumbnailUrl}
          alt={post.thumbnailName || "Post Thumbnail"}
          objectFit="contain"
          h="600px"
          w="100%"
        />
      )}
      <CardBody>
        <Text>{post.description}</Text>
        {track && (
          <Box mt={4}>
            <Heading size="sm">Track:</Heading>
            <Flex align="center" mt={2}>
              <Button
                leftIcon={<FaPlay />}
                variant="solid"
                colorScheme="teal"
                size="sm"
                onClick={() => window.open(track.trackUrl, "_blank")}
              >
                Play {track.trackName}
              </Button>
            </Flex>
          </Box>
        )}
      </CardBody>
      <CardFooter flexDirection="column" gap={4}>
        <Flex justifyContent="space-between" w="full">
          <Button leftIcon={<FaHeart />} variant="ghost" size="sm">
            Like
          </Button>
          <Button leftIcon={<FaShare />} variant="ghost" size="sm">
            Share
          </Button>
          <Button
            leftIcon={<FaComment />}
            variant="ghost"
            size="sm"
            onClick={() => setIsCommenting(!isCommenting)}
          >
            Comment
          </Button>
        </Flex>

        {isCommenting && (
          <form onSubmit={handleCommentSubmit} style={{ width: "100%" }}>
            <VStack spacing={2} align="stretch">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
              />
              <Flex gap={2}>
                <Input type="file" onChange={handleAttachment} flex={1} />
                <Button type="submit">Post</Button>
              </Flex>
              {attachment && (
                <Flex alignItems="center" gap={2}>
                  <FaPaperclip />
                  <Text fontSize="sm" color="gray.500">
                    {attachment.name}
                  </Text>
                </Flex>
              )}
            </VStack>
          </form>
        )}

        {/* Render comments */}
        <Box mt={4}>
          {comments.length === 0 ? (
            <Text>No comments yet. Be the first to comment!</Text>
          ) : (
            comments.map((comment) => (
              <Box key={comment._id} mb={4}>
                <Flex alignItems="center" gap={2}>
                  <Image
                    borderRadius="full"
                    boxSize="30px"
                    src={comment.user || "https://via.placeholder.com/30"}
                    alt={comment.user || "Unknown"}
                  />
                  <Text fontWeight="bold">{comment.user || "Unknown"}</Text>
                </Flex>
                <Text mt={1}>{comment.comment}</Text>
                {comment.attachment && (
                  <Box mt={2}>
                    <a
                      href={comment.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaPaperclip /> Attachment
                    </a>
                  </Box>
                )}
              </Box>
            ))
          )}
        </Box>
      </CardFooter>
    </Card>
  );
}
