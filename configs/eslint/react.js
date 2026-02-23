import { defineConfig } from "eslint/config";

import { baseConfig } from "./base";

export const reactConfig = defineConfig([
  {
    extends: [baseConfig],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      globals: globals.browser,
    },
  },
]);
