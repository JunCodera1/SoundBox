/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const api = process.env.VITE_API_TARGET || "http://localhost:5000";
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  server: { port: 5173, proxy: { "/api": api, "/media": api } },
  preview: { port: 4173, proxy: { "/api": api, "/media": api } },
  test: { environment: "jsdom", setupFiles: ["./src/test/setup.ts"], globals: true, exclude: ["e2e/**", "node_modules/**"] },
});
