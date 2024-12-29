import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { useCookies } from "react-cookie";

// Importing Pages and Components

import HomePage from "./pages/HomePage";
import FeedPage from "./pages/feed/FeedPage";
import LibraryPage from "./pages/library/LibraryPage";
import UploadPage from "./pages/UploadPage";
import FavouritesPage from "./pages/FavouritesPage";
import TrendingPage from "./pages/trending/TrendingPage";
import LoginPage from "./pages/login/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoggedInHomePage from "./pages/LoggedInHomePage.jsx";
import MySongPage from "./pages/MySongPage.jsx";
import SongContext from "./components/SongContext.jsx";

import "./index.css";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PaymentPage from "./pages/PaymentPage";
import SearchPage from "./pages/SearchPage";
import PlaylistViewPage from "./pages/PlaylistViewPage";
import SuccessPage from "./pages/SuccessPage"; // Import SuccessPage
import PlaylistDetails from "./components/PlaylistDetails";
import AI from "./pages/AI.jsx";
import initialTheme from "./theme/theme";
import AuthLayout from "./layouts/auth";
import AdminLayout from "./layouts/admin";
import RTLLayout from "./layouts/rtl";
import Overview from "./pages/library/Overview";
import Albums from "./pages/library/Albums";
import Playlists from "./pages/library/Playlists";
import Likes from "./pages/library/Likes";
import Following from "./pages/library/Following";
import StorePage from "./pages/store/StorePage";

// Admin Pages (currently commented out for now)
// import AdminDashboard from "@/pages/adminPage/AdminDashboard";
// import AdminStatistics from "./pages/adminPage/AdminStatistics";
// import AdminSongManagement from "./pages/adminPage/AdminSongManagement";
// import AdminUserManagement from "./pages/adminPage/AdminUserManagement";

import FloatingShape from "./components/FloatingShape";

import EmailVerificationPage from "./pages/EmailVerificationPage";
import DashboardPage from "./pages/DashboardPage";

import LoadingSpinner from "./components/LoadingSpinner";

import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

// redirect authenticated users to the home page
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user.isVerified) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const [cookie] = useCookies(["token"]);
  const isAuthenticated = !!cookie.token; // Check if the user is authenticated based on the presence of the token cookie
  const [currentTheme, setCurrentTheme] = useState(initialTheme);

  // Load song and pause state from localStorage if available
  const storedSong = JSON.parse(localStorage.getItem("currentSong"));
  const storedIsPaused = JSON.parse(localStorage.getItem("isPaused"));

  const [currentSong, setCurrentSong] = useState(storedSong || null);
  const [soundPlayed, setSoundPlayed] = useState(null);
  const [isPaused, setIsPaused] = useState(storedIsPaused || true);

  // Store current song and pause state to localStorage when they change
  useEffect(() => {
    if (currentSong) {
      localStorage.setItem("currentSong", JSON.stringify(currentSong));
    }
    localStorage.setItem("isPaused", JSON.stringify(isPaused));
  }, [currentSong, isPaused]);

  return (
    <SongContext.Provider
      value={{
        currentSong,
        setCurrentSong,
        soundPlayed,
        setSoundPlayed,
        isPaused,
        setIsPaused,
      }}
    >
      <Router future={{ v7_relativeSplatPath: true }}>
        <Box
          minH={{
            base: "100vh",
            sm: "100vh",
            md: "163vh",
            lg: "102vh",
            xl: "100vh",
            "2xl": "110vh",
          }}
          minW={{
            base: "98vw",
            sm: "100vw",
            md: "167vw",
            lg: "128vw",
            xl: "90vw",
            "2xl": "100vw",
          }}
          bg={useColorModeValue("white", "gray.800")}
          color={useColorModeValue("gray.600", "white")}
          h={{ md: "70vh" }}
          mx="auto"
        >
          <FloatingShape
            color="bg-green-500"
            size="w-64 h-64"
            top="-5%"
            left="10%"
            delay={0}
          />
          <FloatingShape
            color="bg-emerald-500"
            size="w-48 h-48"
            top="70%"
            left="80%"
            delay={5}
          />
          <FloatingShape
            color="bg-lime-500"
            size="w-32 h-32"
            top="40%"
            left="-10%"
            delay={2}
          />
          {isAuthenticated ? (
            // Authenticated Routes

            <Routes>
              {/* Admin Layout (Currently Commented Out) */}
              <Route path="auth/*" element={<AuthLayout />} />
              <Route
                path="admin/*"
                element={
                  <AdminLayout
                    theme={currentTheme}
                    setTheme={setCurrentTheme}
                  />
                }
              />
              <Route
                path="rtl/*"
                element={
                  <RTLLayout theme={currentTheme} setTheme={setCurrentTheme} />
                }
              />
              {/* Regular User Routes */}
              <Route
                path="/playlist/:playlistId"
                element={<PlaylistDetails />}
              />
              <Route path="/store" element={<StorePage />} />
              <Route path="/" element={<LoggedInHomePage />} />
              <Route path="/ai" element={<AI />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/library" element={<LibraryPage />}>
                <Route path="overview" element={<Overview />} />
                <Route path="likes" element={<Likes />} />
                <Route path="playlists" element={<Playlists />} />
                <Route path="albums" element={<Albums />} />
                <Route path="following" element={<Following />} />
              </Route>
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/favourites" element={<FavouritesPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/playlistView" element={<PlaylistViewPage />} />
              <Route path="/mysongs" element={<MySongPage />} />

              {/* Admin Routes (Currently Commented Out) */}
              {/* <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/songs" element={<AdminSongManagement />} />
              <Route path="/admin/users" element={<AdminUserManagement />} />
              <Route path="/statistics" element={<AdminStatistics />} /> */}

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          ) : (
            // Unauthenticated Routes
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/signup"
                element={
                  <RedirectAuthenticatedUser>
                    <SignUpPage />
                  </RedirectAuthenticatedUser>
                }
              />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route
                path="/forgotPassword"
                element={
                  <RedirectAuthenticatedUser>
                    <ForgotPasswordPage />
                  </RedirectAuthenticatedUser>
                }
              />
              <Route
                path="/resetPassword/:token"
                element={
                  <RedirectAuthenticatedUser>
                    <ResetPasswordPage />
                  </RedirectAuthenticatedUser>
                }
              />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="*" element={<Navigate to="/login" />} />
              <Route path="/store" element={<StorePage />} />

              {/* For testing routes */}
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/favourites" element={<FavouritesPage />} />
              <Route path="/ai" element={<AI />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/playlistView" element={<PlaylistViewPage />} />
              <Route path="/library" element={<LibraryPage />}>
                <Route path="overview" element={<Overview />} />
                <Route path="likes" element={<Likes />} />
                <Route path="playlists" element={<Playlists />} />
                <Route path="albums" element={<Albums />} />
              </Route>
            </Routes>
          )}
        </Box>
      </Router>
    </SongContext.Provider>
  );
};

export default App;
