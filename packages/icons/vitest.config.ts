import { resolve } from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";

import { sharedConfig } from "@justkits/vitest-config";

const config = defineConfig({
  resolve: {
    alias: {
      "@icons": resolve(__dirname, "src"),
      "@scripts": resolve(__dirname, "scripts"),
      "node:fs/promises": resolve(__dirname, "tests/__mocks__/fs-promises.ts"),
      "fast-glob": resolve(__dirname, "tests/__mocks__/fast-glob.ts"),
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
  },
});

export default mergeConfig(sharedConfig, config);
