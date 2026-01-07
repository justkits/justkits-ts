import { defineConfig } from "tsup";

export default defineConfig([
  // Library export (index.ts) - no shebang
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    tsconfig: "./tsconfig.build.json",
    clean: true,
    splitting: false,
    sourcemap: true,
    minify: true,
    treeshake: true,
  },
  // CLI entry point (generate.ts) - with shebang
  {
    entry: ["src/generate.ts"],
    format: ["esm"],
    dts: false,
    tsconfig: "./tsconfig.build.json",
    clean: false, // Don't clean again
    splitting: false,
    sourcemap: true,
    minify: true,
    treeshake: true,
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
