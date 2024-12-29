// Chakra imports
import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import PropTypes from "prop-types";
import React from "react";
import Footer from "@/adminComponents/footer/FooterAuth";
import FixedPlugin from "@/adminComponents/fixedPlugin/FixedPlugin";
// Custom components
import { NavLink } from "react-router-dom";
// Assets
import { FaChevronLeft } from "react-icons/fa";

function AuthIllustration(props) {
  const { children, illustrationBackground } = props;
  // Chakra color mode
  return (
    <Flex position="relative" h="max-content">
      <Flex
        h={{
          sm: "initial",
          md: "unset",
          lg: "100vh",
          xl: "97vh",
        }}
        w="100%"
        maxW={{ md: "66%", lg: "1313px" }}
        mx="auto"
        pt={{ sm: "50px", md: "0px" }}
        px={{ lg: "30px", xl: "0px" }}
        ps={{ xl: "70px" }}
        justifyContent="start"
        direction="column"
      >
        <NavLink
          to="/admin"
          style={() => ({
            width: "fit-content",
            marginTop: "40px",
          })}
        >
          <Flex
            align="center"
            ps={{ base: "25px", lg: "0px" }}
            pt={{ lg: "0px", xl: "0px" }}
            w="fit-content"
          >
            <Icon
              as={FaChevronLeft}
              me="12px"
              h="13px"
              w="8px"
              color="secondaryGray.600"
            />
            <Text ms="0px" fontSize="sm" color="secondaryGray.600">
              Back to Simmmple
            </Text>
          </Flex>
        </NavLink>
        {children}

        <Footer />
      </Flex>
      <FixedPlugin />
    </Flex>
  );
}
// PROPS

AuthIllustration.propTypes = {
  illustrationBackground: PropTypes.string,
  image: PropTypes.any,
};

export default AuthIllustration;
