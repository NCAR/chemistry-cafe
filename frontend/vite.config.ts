import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // musica loads its WASM module with a dynamic import. Pre-bundling breaks the
  // path to the .wasm file, so Vite must serve the package as it is.
  optimizeDeps: {
    exclude: ["@ncar/musica"],
  },
});
