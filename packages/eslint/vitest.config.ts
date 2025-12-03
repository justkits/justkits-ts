import { defineConfig, mergeConfig } from "vitest/config";

import { sharedConfig } from "@justkits/vitest-config";

const config = defineConfig({
  test: {
    root: __dirname,
    include: ["src/**/*.test.ts"],
    coverage: {
      include: ["src/cli/**/*.ts"],
      exclude: ["src/__tests__/*", "src/cli/index.ts"],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});

export default mergeConfig(sharedConfig, config);
