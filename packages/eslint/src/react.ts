import { defineConfig } from "eslint/config";
import pluginReact from "eslint-plugin-react";
import css from "@eslint/css";

export const reactConfig = defineConfig([
  // @ts-expect-error: eslint-plugin-react types are incompatible with current eslint core
  {
    ...pluginReact.configs.flat.recommended,
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    files: ["**/*.css"],
    plugins: {
      // @ts-expect-error: @eslint/css types are incompatible with current eslint core
      css,
    },
    language: "css/css",
    extends: ["css/recommended"],
  },
]);
