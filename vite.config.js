import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// `npm run build`             → normal site in dist/ (deploy to Netlify/Vercel)
// `npm run build:standalone`  → ONE self-contained HTML file in dist-standalone/
//                               (opens by double-click, no install or server needed)
export default defineConfig(({ mode }) => {
  const standalone = mode === "standalone";
  return {
    base: "./",
    plugins: [react(), tailwindcss(), ...(standalone ? [viteSingleFile()] : [])],
    build: {
      chunkSizeWarningLimit: 2000,
      outDir: standalone ? "dist-standalone" : "dist",
    },
  };
});
