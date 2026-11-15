import { defineConfig } from "@playwright/test";
// Runs against an isolated test API (soundbox_e2e DB) + the built SPA served by `vite preview`.
export default defineConfig({
  testDir: "./e2e", timeout: 60_000, fullyParallel: false, workers: 1, reporter: [["list"]],
  use: { baseURL: "http://localhost:4173", trace: "retain-on-failure", launchOptions: { executablePath: process.env.PW_CHROMIUM || undefined, args: ["--autoplay-policy=no-user-gesture-required"] } },
  webServer: [
    { command: "node ../backend/src/scripts/e2e-server.js", url: "http://localhost:5055/api/health", reuseExistingServer: false, timeout: 60_000 },
    { command: "npm run build && VITE_API_TARGET=http://localhost:5055 npx vite preview --strictPort", url: "http://localhost:4173", reuseExistingServer: false, timeout: 120_000 },
  ],
});
