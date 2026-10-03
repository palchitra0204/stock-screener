import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 70,
        statements: 70,
        branches: 65,
        functions: 50,
      },
      exclude: [
        "node_modules/",
        "src/test/",
        "src/types/**",
        "src/pages/**",
        "*.config.js",
        "*.config.ts",
        "**/*.d.ts",
        ".next/",
        "scripts/",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
