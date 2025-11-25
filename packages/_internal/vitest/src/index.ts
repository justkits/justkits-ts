import { defineConfig } from "vitest/config";

export const sharedConfig = defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "istanbul",
      reporter: [["text", { skipFull: true }], "lcov"],
    },
  },
});
