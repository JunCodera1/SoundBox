import React, { useState } from "react";
import { GiMusicSpell } from "react-icons/gi";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import Input from "@/components/Input";
import Navbar from "@/components/Navbar";
import { useCookies } from "react-cookie";
import { makeAuthenticatedPOSTRequest } from "@/utils/serverHelper";
import { Bounce, ToastContainer, toast } from "react-toastify";
import axios from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cookies, setCookie] = useCookies(["token"]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await axios.post("http://localhost:8080/auth/login", {
        email,
        password,
      });

      console.log("API Response:", result);

      if (result.data && result.data.token) {
        const { token } = result.data;

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 3000);
        setCookie("token", token, {
          path: "/",
          expires: expiryDate,
        });

        console.log("Login Success");
        alert("Login successful!");
        navigate("/home");
      } else {
        alert("Login failed. Incorrect email or password.");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const menuItemsLeft = [
    { label: "Home", uri: "/" },
    { label: "Feed", uri: "/feed" },
    { label: "Trending", uri: "/trending" },
    { label: "Upload", uri: "/upload" },
    { label: "Premium", uri: "/payment" },
    { label: "Store", uri: "/store" },
  ];

  const menuItemsRight = [{ label: "Sign Up", uri: "/signup" }];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center text-white">
      {/* Navbar */}
      <Navbar menuItemsLeft={menuItemsLeft} menuItemsRight={menuItemsRight} />

      {/* Logo Section */}
      <div className="flex flex-col items-center mt-10">
        <GiMusicSpell size={100} className="text-green-500" />
        <h1 className="text-4xl font-extrabold mt-4 text-green-400">
          Soundbox
        </h1>
      </div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg mt-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-green-400 mb-4">
          Log in to continue
        </h2>

        <form className="space-y-4">
          <Input
            icon={Mail}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <Link to="/forgotPassword" className="text-sm text-green-300">
              Forgot password?
            </Link>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-md text-white font-bold hover:from-green-600 hover:to-teal-700 transition"
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            {loading ? <Loader className="animate-spin mx-auto" /> : "Log In"}
          </motion.button>
        </form>
      </motion.div>

      {/* Sign Up Section */}
      <div className="mt-6 text-center">
        <p>
          Don't have an account?{" "}
          <Link to="/signup" className="text-green-400 font-bold">
            Sign up for Soundbox
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
