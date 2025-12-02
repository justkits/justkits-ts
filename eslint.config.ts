import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { defineConfig } from "eslint/config";
import { allConfig } from "@justkits/eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
