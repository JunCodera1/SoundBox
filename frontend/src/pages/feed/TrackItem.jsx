import React, { useState } from "react";
import { Play, Pause, Heart, Share2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TrackItem = ({ track, setCurrentTrack, setTracks }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    setCurrentTrack(isPlaying ? null : track);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // Here you would typically make an API call to update the like status
  };

  const handleShare = () => {
    // Implement share functionality
    console.log("Sharing track:", track.title);
  };

  const handleDelete = () => {
    // Here you would typically make an API call to delete the track
    setTracks((prevTracks) => prevTracks.filter((t) => t._id !== track._id));
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center space-x-4">
      <div className="flex-shrink-0">
        <Avatar className="w-16 h-16">
          <AvatarImage src={track.thumbnail} alt={track.title} />
          <AvatarFallback>{track.title ? track.title[0] : "T"}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-white">{track.title}</h3>
        <p className="text-gray-400">
          {track.artist && typeof track.artist === "object"
            ? track.artist.username
            : track.artist}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={handlePlayPause}>
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={handleLike}>
          <div className="flex items-center">
            <span className="mr-2">{track.likes ? track.likes : 0}</span>
            <Heart
              className={`h-6 w-6 ${
                isLiked ? "text-red-500" : "text-gray-400"
              }`}
              fill={isLiked ? "#f56565" : "none"} // Điều chỉnh màu sắc cho hợp lý hơn
            />
          </div>
        </Button>
        <Button variant="ghost" size="icon" onClick={handleShare}>
          <Share2 className="h-6 w-6" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
            {/* Add more menu items as needed */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TrackItem;
