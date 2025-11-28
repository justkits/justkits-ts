import { defineConfig } from "eslint/config";
import json from "@eslint/json";

export const jsonConfig = defineConfig({
  files: ["**/*.{json,jsonc,json5}"],
  plugins: { json },
  language: "json/json",
  extends: ["json/recommended"],
});
