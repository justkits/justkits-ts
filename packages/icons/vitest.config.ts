import { resolve } from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";

import { sharedConfig } from "@justkits/vitest-config";

const config = defineConfig({
  resolve: {
    alias: {
      "@icons": resolve(__dirname, "src"),
      "@justkits/svgs-core": resolve(__dirname, "tests/__mocks__/svgs-core.ts"),
      "react-native-svg": resolve(
        __dirname,
        "tests/__mocks__/react-native-svg.tsx",
      ),
    },
  },
  test: {
    root: __dirname,
    environment: "jsdom",
    include: ["tests/**/*.test.tsx"],
    coverage: {
      include: ["src/**/*.tsx", "scripts/**/*.ts"],
      exclude: ["tests/*"],
    },
  },
});

export default mergeConfig(sharedConfig, config);
