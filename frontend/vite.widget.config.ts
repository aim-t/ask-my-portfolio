import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Widget build: a single self-contained script (React bundled in, not
// external) that a host page drops in with one <script> tag, the same
// "no build step, no dependencies" promise widget/chat-widget.html made,
// just built from the real React component instead of a hand-written copy.
// See frontend/README.md for embedding instructions.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Vite's library mode skips replacing process.env.NODE_ENV by default,
  // on the assumption a "library" build gets re-bundled by a consuming
  // app's own bundler later. This widget is meant to run directly in a
  // browser via a plain <script> tag instead, so without this, the
  // shipped bundle would still contain React's literal
  // `process.env.NODE_ENV !== "production"` dev-mode checks and throw
  // "process is not defined" the moment it loads in any real browser.
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "dist-widget",
    emptyOutDir: true,
    lib: {
      entry: fileURLToPath(new URL("./src/widget/mount.tsx", import.meta.url)),
      name: "AskMyPortfolioWidget",
      formats: ["iife"],
      fileName: () => "ask-my-portfolio-widget.js",
    },
  },
});
