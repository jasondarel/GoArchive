import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";

config({ path: ".env.local" });

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false, 
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  // Auto-start Next.js dev server before tests
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true, // use already-running dev 
    timeout: 120_000,
  },

  projects: [
    // 1. Run global setup first to save auth state
    {
      name: "setup",
      testMatch: /global-setup\.ts/,
    },

    // 2. Run all other tests using saved auth state (real Chrome)
    {
      name: "chrome",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome", 
        storageState: "tests/.auth/user.json",
      },
      dependencies: ["setup"],
      testIgnore: /global-setup\.ts/,
    },
  ],
});
