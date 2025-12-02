import { defineConfig } from "eslint/config";
import markdown from "@eslint/markdown";

export const markdownConfig = defineConfig({
  files: ["**/*.md"],
  plugins: {
    // @ts-expect-error: @eslint/markdown types are incompatible with current eslint core
    markdown,
  },
  language: "markdown/gfm",
  extends: ["markdown/recommended"],
});
