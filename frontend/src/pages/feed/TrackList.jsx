import React from "react";
import TrackItem from "./TrackItem";

const TrackList = ({
  tracks,
  setCurrentTrack,
  setTracks,
  lastTrackElementRef,
}) => {
  return (
    <div className="space-y-4">
      {tracks.map((track, index) => (
        <div
          key={track._id}
          ref={index === tracks.length - 1 ? lastTrackElementRef : null}
        >
          <TrackItem
            track={track}
            setCurrentTrack={setCurrentTrack}
            setTracks={setTracks}
          />
        </div>
      ))}
    </div>
  );
};

export default TrackList;
