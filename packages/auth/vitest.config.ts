import { resolve } from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";

import { sharedConfig } from "@justkits/configs/vitest";

const config = defineConfig({
  test: {
    root: __dirname,
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/index.ts", "src/**/config.ts"],
    },
    setupFiles: ["tests/setup/vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});

export default mergeConfig(sharedConfig, config);
