import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  plugins: [react()],
  resolve: {
    alias: {
      "quote-invoice-pdf": path.resolve(root, "../src/index.ts"),
      "quote-invoice-pdf/react": path.resolve(root, "../src/react/index.ts"),
    },
  },
  server: {
    port: 5173,
  },
});
