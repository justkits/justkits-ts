import { defineConfig } from "tsup";
import type { Options } from "tsup";

const sharedConfig: Partial<Options> = {
  format: ["esm"],
  tsconfig: "./tsconfig.build.json",
  splitting: false,
  sourcemap: true,
  minify: true,
  treeshake: true,
  // Bundle @justkits packages, mark everything else as external
  // This regex matches: non-scoped packages + scoped packages that aren't @justkits
  external: [/^[^.@][^/]*$/, /^@(?!justkits\/).*$/],
  esbuildOptions(options) {
    options.platform = "node";
    options.mainFields = ["module", "main"];
  },
};

export default defineConfig([
  // Library export (index.ts) - no shebang
  {
    ...sharedConfig,
    entry: ["src/index.ts"],
    dts: true,
    clean: true,
  },
  // CLI entry point (generate.ts) - with shebang
  {
    ...sharedConfig,
    entry: ["src/generate.ts"],
    dts: false,
    clean: false, // Don't clean again
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
