"use client";

import { useState, useEffect } from "react";
import { Howl } from "howler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const formatDuration = (durationInSeconds) => {
  if (!durationInSeconds) return "0:00";
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export function SongCard({ song, index, cardBackground }) {
  const [duration, setDuration] = useState(null);
  const [isLoadingDuration, setIsLoadingDuration] = useState(true);

  useEffect(() => {
    if (song.track) {
      const sound = new Howl({
        src: [song.track],
        html5: true,
      });

      sound.on("load", () => {
        setDuration(sound.duration());
        setIsLoadingDuration(false);
        sound.unload();
      });

      // Cleanup
      return () => {
        sound.unload();
      };
    }
  }, [song.track]);

  return (
    <Card className={`bg-${cardBackground} hover:bg-${cardBackground}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold text-gray-400 w-8">
            {index + 1}
          </span>
          <div className="w-10 h-10">
            <Avatar>
              <AvatarImage
                src={song.thumbnail || p1}
                alt={song.name || "Song thumbnail"}
                className="w-16 h-16 bg-cover bg-center rounded-md"
              />
              <AvatarFallback>
                {(
                  song.artist?.username?.[0] ||
                  song.name?.[0] ||
                  "S"
                ).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-white">
              {song.name || "Untitled"}
            </p>
            <p className="text-sm text-gray-400">
              {song.artist?.username || song.artist?.name || "Unknown Artist"}
            </p>
          </div>
          <span className="text-gray-500">
            <div className="text-md text-gray-400">
              {isLoadingDuration ? "Loading..." : formatDuration(duration)}
            </div>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
