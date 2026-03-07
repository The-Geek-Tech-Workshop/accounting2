import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    checker({
      typescript: true,
    }),
  ],
  resolve: {
    alias: {
      "@accounting2/shared": path.resolve(__dirname, "../packages/shared/src"),
    },
  },
  server: {
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
