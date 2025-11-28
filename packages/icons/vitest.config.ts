import { resolve } from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";

import { sharedConfig } from "@justkits/vitest-config";

const config = defineConfig({
  resolve: {
    alias: {
      "@icons": resolve(__dirname, "src"),
      "react-native-svg": resolve(
        __dirname,
        "src/__tests__/__mocks__/react-native-svg.tsx",
      ),
    },
  },
  test: {
    root: __dirname,
    environment: "jsdom",
    include: ["src/**/*.test.tsx"],
    coverage: {
      include: ["src/**/*.tsx"],
      exclude: ["src/__tests__/*"],
    },
  },
});

export default mergeConfig(sharedConfig, config);
