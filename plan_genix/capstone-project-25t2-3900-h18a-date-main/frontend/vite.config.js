// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_BASE = process.env.VITE_API_BASE ?? "http://localhost:5005";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    open: process.env.OPEN_BROWSER === "true",
    historyApiFallback: true,
    proxy: {
      "/v1": { target: API_BASE, changeOrigin: true },
      "/info": { target: API_BASE, changeOrigin: true },
      "/plan": { target: API_BASE, changeOrigin: true },
      "/upload": { target: API_BASE, changeOrigin: true },
    },
  },
  build: { outDir: "dist", sourcemap: true },
});
