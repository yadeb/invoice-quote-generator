import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    outDir: "dist",
    external: ["jspdf", "jspdf-autotable"],
  },
  {
    entry: ["src/react/index.ts"],
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: false,
    outDir: "dist/react",
    external: ["react", "react-dom", "react/jsx-runtime", "jspdf", "jspdf-autotable"],
    esbuildOptions(options) {
      options.banner = undefined;
    },
  },
]);
