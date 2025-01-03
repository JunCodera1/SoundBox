import React from "react";
import { Box, Text, VStack } from "@chakra-ui/react";

const SongDetails = () => {
  return (
    <Box>
      <Text fontSize="2xl" fontWeight="bold" mb="10px">
        Song Details
      </Text>
      <VStack spacing="10px" align="flex-start">
        <Text>
          <strong>Song name:</strong> Shape of You
        </Text>
        <Text>
          <strong>Artist:</strong> Ed Sheeran
        </Text>
        <Text>
          <strong>Year of release:</strong> 2017
        </Text>
        <Text>
          <strong>Genre:</strong> Pop
        </Text>
        <Text>
          <strong>Duration:</strong> 4:24
        </Text>
        {/* Các thông tin chi tiết khác */}
      </VStack>
    </Box>
  );
};

export default SongDetails;
