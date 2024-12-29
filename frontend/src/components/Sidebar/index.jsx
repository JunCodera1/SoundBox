import React, { useState, useEffect } from "react";
import {
  Flex,
  Text,
  IconButton,
  Divider,
  Avatar,
  Heading,
  useColorModeValue,
  useBreakpointValue,
  Box,
} from "@chakra-ui/react";
import { FiMenu } from "react-icons/fi";

import Cookies from "js-cookie";
import { makeAuthenticatedGETRequest } from "@/utils/serverHelper";
import { jwtDecode } from "jwt-decode";
import { PiPlaylistBold } from "react-icons/pi";
import { AiFillPlusSquare } from "react-icons/ai";
import { IoLibrarySharp } from "react-icons/io5";
import { FaHeartCirclePlus } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { IoIosHome } from "react-icons/io";
import { FaEarthAsia } from "react-icons/fa6";
import { FaPenFancy } from "react-icons/fa";

import avatarImg from "../../assets/Pictures/0c1f51cf62b4a54f6b80e5a29224390f.jpg";

import NavItem from "./NavItem";
import { FaMusic } from "react-icons/fa";
import { GiMusicSpell } from "react-icons/gi";

export default function Sidebar() {
  const [navSize, changeNavSize] = useState("large");
  const isSmallScreen = useBreakpointValue({ base: true, md: false });
  const iconColor = useColorModeValue("black", "white");
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  // Move the fetchUserData logic into a stable useEffect that won't alter hooks
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.identifier;

        const fetchUserData = async () => {
          try {
            const response = await fetch(`/user/get/users/${userId}`);
            setUserData(response);
          } catch (err) {
            setError("Failed to fetch user data.");
          }
        };
        fetchUserData();
      } catch (err) {
        setError("Invalid token.");
      }
    } else {
      setError("User is not authenticated.");
    }
  }, []); // Runs once when the component mounts

  // Adjust the navigation size on screen change
  useEffect(() => {
    if (isSmallScreen) {
      changeNavSize("small");
    } else {
      changeNavSize("large");
    }
  }, [isSmallScreen]);

  return (
    <Flex
      pos="flex-start"
      left="0"
      h={"720px"}
      marginTop="2.5vh"
      boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)"
      borderRadius={navSize === "small" ? "15px" : "30px"}
      w={navSize === "small" ? "75px" : { base: "75px", md: "200px" }}
      flexDir="column"
      justifyContent="flex-start"
      bg={useColorModeValue("gray.100", "gray.700")}
      marginLeft={"10px"}
      zIndex={"100"}
      style={{
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.8)",
        transition: "all 0.3s ease",
      }}
    >
      <Flex
        p="5%"
        flexDir="column"
        w="100%"
        alignItems={navSize == "small" ? "center" : "flex-start"}
        as="nav"
      >
        <IconButton
          background="none"
          mt={5}
          _hover={{ background: "teal", transition: "transform 0.3s ease" }}
          icon={<FiMenu />}
          onClick={() => {
            if (navSize === "small") changeNavSize("large");
            else changeNavSize("small");
          }}
          className="sm:hidden" // Ẩn khi màn hình nhỏ hơn 'sm'
        />
        <NavItem
          navSize={navSize}
          icon={FaSearch}
          title="Search"
          description="This is the description for the dashboard."
          href={"/search"}
        />
        <NavItem
          navSize={navSize}
          icon={FaPenFancy}
          title="AI support"
          description="This is the description for the dashboard."
          href={"/ai"}
        />
        <NavItem
          navSize={navSize}
          icon={IoLibrarySharp}
          title="Library"
          href={"/library"}
        />
        <NavItem
          navSize={navSize}
          icon={PiPlaylistBold}
          title="Playlist Create"
          href={"/playlistView"}
        />
        <NavItem
          navSize={navSize}
          icon={FaMusic}
          title="My uploaded music"
          href={"/mysongs"}
        />
        {/* <NavItem
          navSize={navSize}
          icon={FaHeartCirclePlus}
          title="Liked songs"
        /> */}
      </Flex>

      <Box px={5} mb={4}>
        <Flex
          border="1px"
          borderColor="gray.500"
          color="white"
          px={2}
          py={1}
          rounded="full"
          align="center"
          justify="center"
          _hover={{ borderColor: "white" }}
          cursor="pointer"
        >
          <FaEarthAsia color={iconColor} />
          {navSize !== "small" && (
            <Text color={useColorModeValue("black", "white")} ml={2}>
              English
            </Text>
          )}
        </Flex>
      </Box>
      <Flex
        p="5%"
        flexDir="column"
        w="100%"
        alignItems={navSize == "small" ? "center" : "flex-start"}
        mb={4}
      >
        <Divider display={navSize == "small" ? "none" : "flex"} />
        <Flex mt={4} align="center">
          <Flex mt={4} align="center">
            <Avatar size="sm" src={userData ? userData.avatar : ""} />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
