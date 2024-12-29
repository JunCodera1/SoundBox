import React, { useState } from "react";
import Scroll from "../components/Search/Scroll";
import LoggedInContainer from "../containers/LoggedInContainer";
import SingleSongCard from "../components/Card/SingleSongCard";
import { Icon } from "@iconify/react";

import { makeAuthenticatedGETRequest } from "../utils/serverHelper";

const SearchPage = () => {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [playlistData, setPlaylistData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [songData, setSongData] = useState([]);

  const searchSong = async () => {
    // This function will call the search api
    const songResponse = await makeAuthenticatedGETRequest(
      "/song/get/songname/" + searchText
    );
    setSongData(songResponse.data);
    const playlistResponse = await makeAuthenticatedGETRequest(
      "/playlist/get/playlistname/" + searchText
    );
    setPlaylistData(playlistResponse.data);
  };

  return (
    <LoggedInContainer curActiveScreen="search">
      <div className="w-full py-6">
        <div
          className={`w-1/3 p-3 text-sm rounded-full bg-gray-800 px-5 flex text-white space-x-3 items-center ${
            isInputFocused ? "border-radius border-white" : ""
          }`}
        >
          <Icon icon="ic:outline-search" className="text-lg" />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            className="w-full bg-gray-800 focus:outline-none"
            onFocus={() => {
              setIsInputFocused(true);
            }}
            onBlur={() => {
              setIsInputFocused(false);
            }}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchSong();
              }
            }}
          />
        </div>
        {songData.length > 0 || playlistData.length > 0 ? (
          <div className="pt-10 space-y-5">
            {/* Kết quả bài hát */}
            {songData.length > 0 && (
              <div>
                <div className="text-white">
                  Showing song results for
                  <span className="font-bold"> {searchText}</span>
                </div>
                {songData.map((item) => (
                  <SingleSongCard
                    info={item}
                    key={JSON.stringify(item)}
                    playSound={() => {}}
                  />
                ))}
              </div>
            )}

            {/* Kết quả playlist */}
            {Array.isArray(playlistData) && playlistData.length > 0 && (
              <div>
                <div className="text-white">
                  Showing playlist results for
                  <span className="font-bold"> {searchText}</span>
                </div>
                <div className="space-y-3">
                  {playlistData.map((playlist) => (
                    <div
                      key={playlist._id}
                      className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg"
                    >
                      <img
                        src={playlist.thumbnail || "default-thumbnail.png"}
                        alt="Playlist Thumbnail"
                        className="w-12 h-12 rounded-lg"
                      />
                      <div>
                        <div className="text-white font-semibold">
                          {playlist.name}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {playlist.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-400 pt-10">Nothing to show here.</div>
        )}
      </div>
    </LoggedInContainer>
  );
};

export default SearchPage;
