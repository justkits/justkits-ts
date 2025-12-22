import { resolve } from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";

import { sharedConfig } from "@justkits/configs/vitest";

const config = defineConfig({
  resolve: {
    alias: {
      "@icons": resolve(__dirname, "src"),
    },
  },
  test: {
    root: __dirname,
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      include: ["src/**/*.tsx"],
      exclude: ["tests/*"],
    },
  },
});

export default mergeConfig(sharedConfig, config);
