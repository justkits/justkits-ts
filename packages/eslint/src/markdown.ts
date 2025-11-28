import { defineConfig } from "eslint/config";
import markdown from "@eslint/markdown";

export const markdownConfig = defineConfig({
  files: ["**/*.md"],
  plugins: { markdown },
  language: "markdown/gfm",
  extends: ["markdown/recommended"],
});
