import { resolve } from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";

import { sharedConfig } from "@justkits/vitest-config";

const config = defineConfig({
  resolve: {
    alias: {
      "@icons": resolve(__dirname, "src"),
      "@justkits/svgs-core": resolve(__dirname, "tests/__mocks__/svgs-core.ts"),
      "@scripts": resolve(__dirname, "scripts"),
      "react-native-svg": resolve(
        __dirname,
        "tests/__mocks__/react-native-svg.tsx",
      ),
    },
  },
  test: {
    root: __dirname,
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      include: ["src/**/*.tsx", "scripts/**/*.ts"],
      exclude: ["tests/*"],
    },
    setupFiles: ["tests/vitest.setup.ts"],
  },
});

export default mergeConfig(sharedConfig, config);
