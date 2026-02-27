import { resolve } from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";

import { sharedConfig } from "@justkits/vitest-config";

const config = defineConfig({
  test: {
    root: __dirname,
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/index.ts"],
    },
    setupFiles: ["tests/setup/global.mocks.ts"],
  },
  resolve: {
    alias: {
      "@tests": resolve(__dirname, "tests"),
      "@": resolve(__dirname, "src"),
    },
  },
});

export default mergeConfig(sharedConfig, config);
