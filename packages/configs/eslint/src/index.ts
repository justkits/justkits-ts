import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import js from "@eslint/js";

import { jsonConfig } from "./json";
import { markdownConfig } from "./markdown";
import { reactConfig } from "./react";

export const baseConfig = defineConfig([
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  tseslint.configs.recommended,
]);

export const allConfig = defineConfig([
  ...baseConfig,
  ...reactConfig,
  jsonConfig,
  markdownConfig,
]);
