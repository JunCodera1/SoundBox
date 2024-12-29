import { backendUrl } from "./config";
import axios from "axios";

export const makeUnAuthenticatedPOSTRequest = async (route, body) => {
  const response = await fetch(backendUrl + route, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const formattedResponse = await response.json();
  return formattedResponse;
};

export const makeAuthenticatedPOSTRequest = async (route, body) => {
  const token = getToken();

  const response = await fetch(backendUrl + route, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const formattedResponse = await response.json();
  return formattedResponse;
};

export const makeUnAuthenticatedGETRequest = async (route) => {
  const response = await fetch(backendUrl + route, {
    method: "GET", // Thay POST thành GET
    headers: {
      "Content-Type": "application/json",
    },
  });
  const formattedResponse = await response.json();
  return formattedResponse;
};

export const makeAuthenticatedGETRequest = async (route) => {
  const token = getToken();

  const response = await fetch(backendUrl + route, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const formattedResponse = await response.json();
  return formattedResponse;
};
export const makeAuthenticatedPUTRequest = async (route, body) => {
  const token = getToken(); // Get the token, ensure it's defined

  if (!token) {
    throw new Error("No token found. User may not be authenticated.");
  }

  try {
    const response = await fetch(backendUrl + route, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body), // Send the request body with the data to update
    });
    console.log("Response status:", response.status);
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message);
    }

    const formattedResponse = await response.json();
    return formattedResponse;
  } catch (error) {
    console.error("Error making authenticated PUT request:", error);
    throw error;
  }
};
export const makeUnAuthenticatedPUTRequest = async (route, body) => {
  try {
    const response = await fetch(backendUrl + route, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch");
    }

    const formattedResponse = await response.json();
    return formattedResponse;
  } catch (error) {
    console.error("Error in makeUnAuthenticatedPUTRequest:", error);
    throw error;
  }
};

const getToken = () => {
  const tokenMatch = document.cookie.match(/(?:^|;\s*)token\s*=\s*([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  return token;
};
