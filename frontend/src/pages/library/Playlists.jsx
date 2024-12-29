import { makeAuthenticatedGETRequest } from "@/utils/serverHelper";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Playlists = () => {
  const [myPlaylists, setMyPlaylists] = useState([]);
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await makeAuthenticatedGETRequest("/playlist/get/me");
        setMyPlaylists(response.data);
      } catch (err) {
        console.error("Error fetching songs:", err);
      } finally {
      }
    };

    fetchSongs();
  }, []);
  return (
    <div className="text-white px-8 pt-6">
      <div className="text-white text-xl pt-8 font-semibold">My Playlists</div>
      <div className="py-5 grid gap-5 grid-cols-5">
        {myPlaylists?.map((item) => {
          return (
            <Card
              key={JSON.stringify(item)}
              title={item.name}
              description=""
              imgUrl={item.thumbnail}
              playlistId={item._id}
            />
          );
        })}
      </div>
    </div>
  );
};
const Card = ({ title, description, imgUrl, playlistId }) => {
  const navigate = useNavigate();
  return (
    <div
      className="bg-black bg-opacity-40 w-full p-4 rounded-lg cursor-pointer"
      onClick={() => {
        navigate("/playlist/" + playlistId);
      }}
    >
      <div className="pb-4 pt-2">
        <img className="w-full rounded-md" src={imgUrl} alt="label" />
      </div>
      <div className="text-white font-semibold py-3">{title}</div>
      <div className="text-gray-500 text-sm">{description}</div>
    </div>
  );
};

export default Playlists;
