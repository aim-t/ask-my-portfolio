import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Standalone app build: full page at dist/, deployable on its own
// (Vercel, Netlify, or any static host).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Port 3000, not Vite's default 5173: the backend's ALLOWED_ORIGINS
  // default (app/config.py) already whitelists http://localhost:3000
  // for the plain HTML widget, so this makes local dev work against an
  // unmodified backend with no CORS setup step.
  server: {
    port: 3000,
  },
  build: {
    outDir: "dist",
  },
});
