import {
  HStack,
  VStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { RightContent } from "./RightContent";
import { LeftContent } from "./LeftContent";
import { MobileNav } from "./Mobile";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { makeAuthenticatedGETRequest } from "@/utils/serverHelper";
import { jwtDecode } from "jwt-decode";

export function Navbar({ menuItemsLeft, menuItemsRight }) {
  const { isOpen, onToggle } = useDisclosure();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = Cookies.get("token"); // Lấy token từ cookie

    if (token) {
      try {
        // Decode the token
        const decodedToken = jwtDecode(token);

        const userId = decodedToken.identifier; // Access the user ID from the token

        const fetchUserData = async () => {
          try {
            setIsLoading(true);
            const response = await makeAuthenticatedGETRequest(
              `/user/get/users/${userId}` // Sử dụng userId từ token
            );

            setUserData(response); // `response` contains the user data directly
          } catch (err) {
            setError("Failed to fetch user data. Please try again later.");
            console.error("Error fetching user data:", err);
          } finally {
            setIsLoading(false);
          }
        };

        fetchUserData();
      } catch (err) {
        setError("Invalid token.");
        console.error("Error decoding token:", err);
      }
    } else {
      setError("User is not authenticated.");
    }
  }, []); // Chạy 1 lần khi component mount

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <VStack w="full" spacing={0}>
      <HStack
        w="full"
        alignItems="center"
        p={2}
        justifyContent="space-between"
        borderBottomWidth={1}
        bg={useColorModeValue("gray.300", "gray.800")}
      >
        {/* Left content */}
        <LeftContent items={menuItemsLeft} onToggle={onToggle} />
        {/* Right content */}
        <RightContent
          items={menuItemsRight}
          onToggle={onToggle}
          user={userData}
        />
      </HStack>
      {/* Mobile content */}
      <MobileNav items={menuItemsLeft} isOpen={isOpen} />
    </VStack>
  );
}

export default Navbar;
