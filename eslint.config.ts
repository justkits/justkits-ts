import { defineConfig } from "eslint/config";
import { allConfig } from "@justkits/eslint";

export default defineConfig([
  ...allConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
  },
]);
