import { defineConfig, globalIgnores } from "eslint/config";
import { reactConfig } from "@justkits/eslint-config/react";

export default defineConfig([
  globalIgnores(["tsconfig.app.json", "tsconfig.node.json"]),
  {
    extends: [reactConfig],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
