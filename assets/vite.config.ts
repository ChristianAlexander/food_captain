import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: "dev",
  resolve: {
    alias: {
      "/js": path.resolve(import.meta.dirname, "./js"),
    },
  },
  server: {
    port: 3000,
  },
});
