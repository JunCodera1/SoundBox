import jwt from "jsonwebtoken";

const getToken = (user) => {
  // Validate the user object
  if (!user || !user._id) {
    throw new Error("User or user._id is missing");
  }

  // Construct payload with user information
  const payload = {
    identifier: user._id,
    roles: user.roles || [], // Assuming roles is an array on the user object
    username: user.username || "", // Assuming username is on the user object
  };

  // Generate JWT with the payload and secret key from environment variables
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "6h", // Token expiration time
  });

  return token;
};

export default getToken;
