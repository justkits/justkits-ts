import { defineConfig } from "eslint/config";
import { baseConfig } from "@justkits/eslint-config/base";

export default defineConfig([
  {
    extends: [baseConfig],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
