import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom", // simulates a browser environment for React testing
    setupFiles: ["vitest.setup.ts"], // Ensure this file exists and contains necessary global setups
    globals: true, // Makes globals like describe, expect, it available globally
    coverage: {
      reporter: ["text", "html", "lcov", "cobertura"], // Generates an HTML report
      reportsDirectory: "./coverage", // Directory where reports are saved
      all: true, // Ensures all files are included in coverage even if not directly tested
      exclude: [
        ...configDefaults.exclude,
        "src/main.tsx", // Renders the app, but doesn't export anything so it's excluded
        "**/test/**", // No coverage of test files
      ],
    },
  },
});
