import { defineConfig } from "eslint/config";
import { reactConfig } from "@justkits/eslint-config/react";

export default defineConfig([
  {
    extends: [reactConfig],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["src/**/*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/*"],
              message:
                "Use relative imports within src/. The @/* alias is only for tests.",
            },
          ],
        },
      ],
    },
  },
]);
