import { resolve } from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";

import { sharedConfig } from "@configs/vitest";

const config = defineConfig({
  resolve: {
    alias: {
      "@lib": resolve(__dirname, "src/lib"),
      "@managers": resolve(__dirname, "src/managers"),
      "@utils": resolve(__dirname, "src/utils"),
    },
  },
  test: {
    root: __dirname,
    include: ["src/**/*.test.ts"],
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/__tests__/*"],
    },
    setupFiles: ["src/__tests__/setup/mocks.ts"],
  },
});

export default mergeConfig(sharedConfig, config);
