import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev server proxies /api → Express backend so the browser only ever
// talks to the same origin (works in any preview environment).
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true },
    },
  },
});
