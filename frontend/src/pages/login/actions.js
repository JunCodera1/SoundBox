"use server";

import { cookies } from "next/headers";

export async function login({ email, password }) {
  try {
    const response = await fetch(`/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.token) {
      // Set cookie that expires in 30 days
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      cookies().set("token", data.token, {
        expires: Date.now() + thirtyDays,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return {
        success: true,
      };
    }

    return {
      success: false,
      message: data.message || "Login failed",
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred",
    };
  }
}
