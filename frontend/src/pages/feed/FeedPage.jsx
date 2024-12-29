import React, { useState, useEffect, useCallback, useRef } from "react";
import TrackList from "../../components/TrackList";
import SuggestedArtists from "../../components/SuggestedArtists";
import LoggedInContainer from "@/containers/LoggedInContainer";
import { makeAuthenticatedGETRequest } from "@/utils/serverHelper";
import { CreatePostModal } from "./CreatePostModal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell } from "lucide-react";
import PostCard from "./PostCard";

export default function FeedPage() {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [page, setPage] = useState(1);
  const [artists, setArtists] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [posts, setPosts] = useState([]);

  const observer = useRef();
  const lastTrackElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  // API call
  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoading(true);
      try {
        const response = await makeAuthenticatedGETRequest(
          `/song/get/allSongs`
        );
        const data = response.data;
        setTracks((prevTracks) => [...prevTracks, ...data]);
        setHasMore(data.length > 0);
      } catch (error) {
        console.error("Error fetching tracks:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();
  }, [page, filter]);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await makeAuthenticatedGETRequest("/user/get/users");
        setArtists(response.data);
      } catch (error) {
        console.error("Error fetching artists:", error);
      }
    };
    fetchArtists();
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await makeAuthenticatedGETRequest("/post/get/all");
        console.log(response);
        setPosts(response);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // useEffect(() => {
  //   const fetchUserId = async () => {
  //     try {
  //       const userResponse = await makeAuthenticatedGETRequest("/user/current");
  //       if (!userResponse && !userResponse.data && !userResponse.data._id) {
  //         throw new Error("Invalid user data received");
  //       }
  //       setUserId(userResponse.data._id);
  //     } catch (error) {
  //       console.error("Error fetching user ID:", error);
  //     }
  //   };

  //   fetchUserId();
  // }, []);

  useEffect(() => {
    const newPostsInterval = setInterval(() => {
      // Simulating new posts check
      const newPosts = Math.floor(Math.random() * 3);
      setNewPostsCount((prevCount) => prevCount + newPosts);
    }, 30000); // Check every 30 seconds

    return () => clearInterval(newPostsInterval);
  }, []);

  const handlePostCreated = (newPost) => {
    setTracks((prevTracks) => [newPost, ...prevTracks]);
  };

  const handleLoadNewPosts = () => {
    // In a real app, you'd fetch the new posts here
    setNewPostsCount(0);
    // Simulating new posts being added
    setTracks((prevTracks) => [
      ...Array(newPostsCount)
        .fill()
        .map((_, i) => ({
          id: `new-${i}`,
          title: `New Track ${i + 1}`,
          artist: "New Artist",
        })),
      ...prevTracks,
    ]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <LoggedInContainer>
        <main className="flex-grow flex">
          <div className="flex-grow p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">
                Hear the latest posts from the people you're following:
              </h1>
              <CreatePostModal onPostCreated={handlePostCreated} />
            </div>

            <div className="flex justify-between items-center mb-4">
              <Select
                value={filter}
                onValueChange={(value) => setFilter(value)}
              >
                <div className="text-black">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter posts" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="text-black bg-white">
                      <SelectItem value="all">All Posts</SelectItem>
                      <SelectItem value="following">Following</SelectItem>
                      <SelectItem value="popular">Popular</SelectItem>
                    </div>
                  </SelectContent>
                </div>
              </Select>

              {newPostsCount > 0 && (
                <Button
                  onClick={handleLoadNewPosts}
                  className="flex items-center"
                >
                  <Bell className="mr-2" />
                  {newPostsCount} New Posts
                </Button>
              )}
            </div>

            {/* {isLoading && tracks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Loading tracks...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <TrackList
                tracks={tracks}
                setCurrentTrack={setCurrentTrack}
                setTracks={set  Tracks}
                lastTrackElementRef={lastTrackElementRef}
              />
            )} */}
            <main className="flex-grow p-6">
              <h1 className="text-2xl font-bold mb-6 text-white">
                Latest Posts
              </h1>
              {isLoading ? (
                <div className="text-center text-gray-400">
                  Loading posts...
                </div>
              ) : error ? (
                <div className="text-center text-red-500">{error}</div>
              ) : posts?.length === 0 ? (
                <div className="text-center text-gray-400">
                  No posts available
                </div>
              ) : (
                posts.map((post) => <PostCard key={post._id} post={post} />)
              )}
            </main>

            {isLoading && tracks.length > 0 && (
              <div className="text-center py-4 text-gray-400">
                Loading more...
              </div>
            )}
          </div>

          <SuggestedArtists info={artists} />
        </main>
      </LoggedInContainer>
    </div>
  );
}
