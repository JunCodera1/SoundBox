import React, { useState } from "react";
import {
  Avatar,
  Flex,
  IconButton,
  Input,
  Button,
  useColorMode,
  List,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Badge,
  Box,
  Text,
  VStack,
  HStack,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import {
  FaBell,
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaCog,
  FaMusic,
  FaHeart,
  FaClock,
} from "react-icons/fa";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { NavItem } from "./NavItem";
import { Navigate } from "react-router-dom";

export function RightContent({ items, user = null }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const {
    isOpen: isProfileOpen,
    onOpen: onProfileOpen,
    onClose: onProfileClose,
  } = useDisclosure();

  const {
    isOpen: isSettingsOpen,
    onOpen: onSettingsOpen,
    onClose: onSettingsClose,
  } = useDisclosure();

  const deleteCookie = (name) => {
    document.cookie = `${name}=; Max-Age=-99999999; path=/;`;
  };

  const handleLogout = () => {
    // Delete the token cookie
    deleteCookie("token");

    // Reset user state to null or empty
    setUser(null); // If user is stored in state

    // Optionally, navigate the user to the login page
    Navigate("/login");

    console.log("Logged out");
  };

  const profileData = {
    name: user?.username || "Unknown",
    email: user?.email || "N/A",
    role: user?.role || "User",
    joinDate: "January 1, 2023",
    totalListeningTime: "500 hours",
    favoriteGenre: "Rock",
    playlists: [
      { name: "My Favorites", songCount: 50 },
      { name: "Workout Mix", songCount: 25 },
      { name: "Chill Vibes", songCount: 40 },
    ],
    recentlyPlayed: [
      { name: "Song 1", artist: "Artist 1" },
      { name: "Song 2", artist: "Artist 2" },
      { name: "Song 3", artist: "Artist 3" },
    ],
    stats: {
      songsListened: 1500,
      artistsDiscovered: 200,
      topArtist: "The Beatles",
    },
  };

  const [notifications, setNotifications] = useState([
    { id: 1, message: "New message from admin", read: false },
    { id: 2, message: "Your subscription is about to expire", read: false },
    { id: 3, message: "New song added to your playlist", read: true },
  ]);

  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Track 1", price: "$1.99" },
    { id: 2, name: "Track 2", price: "$1.99" },
    { id: 3, name: "Track 3", price: "$1.99" },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  return (
    <Flex alignItems="center" gap={2}>
      <IconButton
        aria-label="search"
        icon={<FaSearch />}
        variant="ghost"
        colorScheme="teal"
        display={{ base: "flex", md: "none" }}
        rounded="full"
        size="sm"
      />

      {/* Notifications */}
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="notifications"
          icon={<FaBell />}
          variant="ghost"
          colorScheme="teal"
          rounded="full"
          size="sm"
          position="relative"
        >
          {notifications.some((notif) => !notif.read) && (
            <Badge
              colorScheme="red"
              position="absolute"
              top="0"
              right="0"
              fontSize="xs"
              rounded="full"
              bg={""}
            >
              {notifications.filter((notif) => !notif.read).length}
            </Badge>
          )}
        </MenuButton>
        <MenuList>
          {notifications.map((notif) => (
            <MenuItem
              key={notif.id}
              bg={notif.read ? "gray.500" : "gray.700"}
              fontWeight={notif.read ? "normal" : "bold"}
            >
              {notif.message}
            </MenuItem>
          ))}
          <MenuItem fontWeight="bold" onClick={markAllAsRead}>
            Mark all as read
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Avatar with Dropdown Menu */}
      {user ? (
        <Menu>
          <MenuButton
            as={Avatar}
            size="sm"
            name={user.name}
            src={user.avatar || "https://via.placeholder.com/150"}
            cursor="pointer"
          />
          <MenuList>
            <MenuItem onClick={onProfileOpen} icon={<FaUser />}>
              View Profile
            </MenuItem>
            <MenuItem onClick={onSettingsOpen} icon={<FaCog />}>
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </MenuList>
        </Menu>
      ) : (
        ""
      )}

      {/* Cart Menu */}
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="cart"
          icon={<FaShoppingCart />}
          variant="ghost"
          colorScheme="teal"
          rounded="full"
          size="sm"
          position="relative"
        >
          {cartItems.length > 0 && (
            <Badge
              colorScheme="red"
              position="absolute"
              top="0"
              right="0"
              fontSize="xs"
              rounded="full"
            >
              {cartItems.length}
            </Badge>
          )}
        </MenuButton>
        <MenuList>
          {cartItems.map((item) => (
            <MenuItem key={item.id}>
              {item.name} - {item.price}
            </MenuItem>
          ))}
          <MenuItem fontWeight="bold" onClick={() => setCartItems([])}>
            Clear Cart
          </MenuItem>
        </MenuList>
      </Menu>

      <List gap={1} display={{ base: "none", md: "flex", lg: "flex" }}>
        {Array.isArray(items) &&
          items.map((item) => <NavItem key={item.label} {...item} />)}
        {user ? "" : <NavItem label={"Login"} uri={"/login"} />}
      </List>

      <IconButton
        aria-label="toggle color mode"
        icon={colorMode === "light" ? <IoMoon /> : <LuSun size="20" />}
        variant="ghost"
        colorScheme="teal"
        onClick={toggleColorMode}
      />

      {/* Enhanced Modal for Profile */}
      <Modal isOpen={isProfileOpen} onClose={onProfileClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="teal.500" color="white" borderTopRadius="md">
            User Profile
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <Flex alignItems="center" justifyContent="space-between">
                <HStack>
                  <Avatar
                    size="xl"
                    name={profileData.name}
                    src={user?.avatar || "https://via.placeholder.com/150"}
                  />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold">
                      {profileData.name}
                    </Text>
                    <Text color="gray.500">{profileData.email}</Text>
                    <Badge colorScheme="teal">{profileData.role}</Badge>
                  </VStack>
                </HStack>
                <VStack align="end">
                  <Text fontWeight="bold">Member since</Text>
                  <Text>{profileData.joinDate}</Text>
                </VStack>
              </Flex>

              <Tabs isFitted variant="enclosed">
                <TabList mb="1em">
                  <Tab>
                    <FaMusic /> Overview
                  </Tab>
                  <Tab>
                    <FaHeart /> Playlists
                  </Tab>
                  <Tab>
                    <FaClock /> Recent Activity
                  </Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <SimpleGrid columns={2} spacing={4}>
                      <Stat>
                        <StatLabel>Total Listening Time</StatLabel>
                        <StatNumber>
                          {profileData.totalListeningTime}
                        </StatNumber>
                        <StatHelpText>Across all tracks</StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel>Favorite Genre</StatLabel>
                        <StatNumber>{profileData.favoriteGenre}</StatNumber>
                        <StatHelpText>Based on your history</StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel>Songs Listened</StatLabel>
                        <StatNumber>
                          {profileData.stats.songsListened}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Artists Discovered</StatLabel>
                        <StatNumber>
                          {profileData.stats.artistsDiscovered}
                        </StatNumber>
                      </Stat>
                    </SimpleGrid>
                    <Box mt={4}>
                      <Text fontWeight="bold">Top Artist</Text>
                      <Text>{profileData.stats.topArtist}</Text>
                    </Box>
                    <Box mt={4}>
                      <Text fontWeight="bold" mb={2}>
                        Listening Habits
                      </Text>
                      <Progress value={80} colorScheme="teal" mb={2} />
                      <Text fontSize="sm">
                        You're in the top 20% of {profileData.favoriteGenre}{" "}
                        listeners
                      </Text>
                    </Box>
                  </TabPanel>
                  <TabPanel>
                    <VStack align="stretch" spacing={4}>
                      {profileData.playlists.map((playlist, index) => (
                        <Box
                          key={index}
                          p={3}
                          shadow="md"
                          borderWidth="1px"
                          borderRadius="md"
                        >
                          <Flex justify="space-between" align="center">
                            <Text fontWeight="bold">{playlist.name}</Text>
                            <Badge colorScheme="teal">
                              {playlist.songCount} songs
                            </Badge>
                          </Flex>
                        </Box>
                      ))}
                    </VStack>
                  </TabPanel>
                  <TabPanel>
                    <VStack align="stretch" spacing={4}>
                      {profileData.recentlyPlayed.map((song, index) => (
                        <Box
                          key={index}
                          p={3}
                          shadow="md"
                          borderWidth="1px"
                          borderRadius="md"
                        >
                          <Flex justify="space-between" align="center">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold">{song.name}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {song.artist}
                              </Text>
                            </VStack>
                            <IconButton
                              aria-label="Add to playlist"
                              icon={<FaHeart />}
                              variant="ghost"
                              colorScheme="teal"
                            />
                          </Flex>
                        </Box>
                      ))}
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={onProfileClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for Settings */}
      <Modal isOpen={isSettingsOpen} onClose={onSettingsClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="teal.500" color="white" borderTopRadius="md">
            Settings
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Update Profile
                </Text>
                <Input
                  placeholder="Update Name"
                  defaultValue={user?.username || ""}
                  variant="filled"
                />
              </Box>
              <Box>
                <Input
                  placeholder="Update Email"
                  defaultValue={user?.email || ""}
                  type="email"
                  variant="filled"
                />
              </Box>
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Change Password
                </Text>
                <Input
                  placeholder="Current Password"
                  type="password"
                  variant="filled"
                  mb={2}
                />
                <Input
                  placeholder="New Password"
                  type="password"
                  variant="filled"
                  mb={2}
                />
                <Input
                  placeholder="Confirm New Password"
                  type="password"
                  variant="filled"
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3}>
              Save Changes
            </Button>
            <Button variant="ghost" onClick={onSettingsClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
