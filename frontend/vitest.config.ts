import { defineConfig } from "vitest/config";
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom", // simulates a browser environment for React testing
    setupFiles: ["vitest.setup.ts"], // Ensure this file exists and contains necessary global setups
    globals: true, // Makes globals like describe, expect, it available globally
    coverage: {
      reporter: ["text", "html", "lcov"], // Generates an HTML report
      reportsDirectory: "./coverage", // Directory where reports are saved
      all: true, // Ensures all files are included in coverage even if not directly tested
    },
  },
});
