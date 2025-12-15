import { resolve } from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";

import { sharedConfig } from "@justkits/configs/vitest";

const config = defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    root: __dirname,
    include: ["tests/**/*.test.ts"],
    coverage: {
      include: ["src/**/*.ts"],
    },
    setupFiles: ["tests/setup/mocks.ts"],
  },
});

export default mergeConfig(sharedConfig, config);
