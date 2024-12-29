import React, { useEffect, useState } from "react";
import UserCard from "./UserCard";
import { makeAuthenticatedGETRequest } from "@/utils/serverHelper";
import { Box, HStack, Text, useColorModeValue } from "@chakra-ui/react";

const UserView = ({ titleText }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await makeAuthenticatedGETRequest("/user/get/users");
        setUsers(response.data); // Limit to the first 5 users
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch users");
        setLoading(false);
        console.error(error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="px-8 py-6">
      <Box
        p="5"
        fontFamily="semibold"
        color={useColorModeValue("black", "gray.200")}
        mb="5"
      >
        <Text fontSize="2xl" fontWeight="semibold">
          {titleText}
        </Text>
      </Box>

      {loading ? (
        <div>Loading...</div> // Display loading spinner
      ) : error ? (
        <div>{error}</div> // Display error message
      ) : (
        <Box overflowX="auto" whiteSpace="nowrap" ml="5">
          <div className="flex gap-6">
            {Array.isArray(users) &&
              users?.map((user, index) => (
                <div key={user.id} className="flex-shrink-0">
                  <UserCard info={user} />
                </div>
              ))}
          </div>
        </Box>
      )}
    </div>
  );
};

export default UserView;
