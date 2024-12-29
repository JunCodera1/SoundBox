import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import LoggedInContainer from "../../containers/LoggedInContainer";
import { makeAuthenticatedGETRequest } from "../../utils/serverHelper";

const Library = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Chỉ điều hướng khi đang ở /library (root của library)
    if (location.pathname === "/library") {
      navigate("overview");
    }
  }, [location, navigate]);
  return (
    <LoggedInContainer curActiveScreen={"library"}>
      <div className="text-white px-8 pt-6 text-2xl">
        {/* Tabs Navigation */}
        <div className="flex space-x-4 border-b border-gray-600 pb-2">
          <NavLink
            to="/library/overview"
            className={({ isActive }) =>
              isActive ? "text-teal-500 font-semibold" : "text-gray-400"
            }
          >
            Overview
          </NavLink>

          <NavLink
            to="/library/playlists"
            className={({ isActive }) =>
              isActive ? "text-teal-500 font-semibold" : "text-gray-400"
            }
          >
            Playlists
          </NavLink>

          <NavLink
            to="/library/following"
            className={({ isActive }) =>
              isActive ? "text-teal-500 font-semibold" : "text-gray-400"
            }
          >
            Following
          </NavLink>
        </div>

        {/* Render nội dung bên trong */}
        <div className="py-4">
          <Outlet />
        </div>
      </div>
      {/*  */}
    </LoggedInContainer>
  );
};

export default Library;
