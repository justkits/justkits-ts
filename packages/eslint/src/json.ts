import { defineConfig } from "eslint/config";
import json from "@eslint/json";

export const jsonConfig = defineConfig({
  files: ["**/*.{json,jsonc,json5}"],
  plugins: {
    // @ts-expect-error: @eslint/json types are incompatible with current eslint core
    json,
  },
  language: "json/json",
  extends: ["json/recommended"],
});
