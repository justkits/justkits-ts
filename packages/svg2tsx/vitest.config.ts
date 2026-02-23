import { resolve } from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";

import { sharedConfig } from "@justkits/vitest-config";

const config = defineConfig({
  resolve: {
    alias: {
      "@lib": resolve(__dirname, "src/lib"),
      "@converter": resolve(__dirname, "src/converter"),
      "@cli": resolve(__dirname, "src/cli"),
      "@tests": resolve(__dirname, "tests"),
    },
  },
  test: {
    root: __dirname,
    include: ["tests/**/*.test.ts"],
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/**/index.ts"],
    },
    setupFiles: ["tests/setup/vitest.setup.ts"],
  },
});

export default mergeConfig(sharedConfig, config);
