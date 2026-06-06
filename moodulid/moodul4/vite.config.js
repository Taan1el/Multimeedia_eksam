import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/build/",
  publicDir: false,
  plugins: [tailwindcss()],
  build: {
    outDir: "public/build",
    emptyOutDir: true,
    rollupOptions: {
      input: "public/src/scripts/main.js",
      output: {
        entryFileNames: "main.js",
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith(".css")
            ? "main.css"
            : "assets/[name]-[hash][extname]",
      },
    },
  },
});
