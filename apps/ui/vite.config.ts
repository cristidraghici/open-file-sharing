import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 3001,
    watch: {
      usePolling: true,
    },
    fs: {
      // allow serving files from the monorepo root (two levels up is the repo root)
      allow: [path.resolve(__dirname, ".."), path.resolve(__dirname, "../../")],
    },
  },
});
