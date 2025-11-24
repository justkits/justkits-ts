import { defineConfig } from "eslint/config";
import pluginReact from "eslint-plugin-react";
import css from "@eslint/css";

export const reactConfig = defineConfig([
  {
    ...pluginReact.configs.flat.recommended,
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
  },
]);
