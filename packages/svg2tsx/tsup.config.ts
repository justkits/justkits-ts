import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "cli/index": "src/cli/index.ts",
  },
  format: ["esm"],
  dts: {
    resolve: true,
    compilerOptions: {
      incremental: false,
      composite: false,
    },
  },
  clean: true,
  shims: false,
  splitting: false,
  treeshake: true,
  minify: false,
  sourcemap: false,
  external: [
    "@svgr/core",
    "@svgr/plugin-jsx",
    "@svgr/plugin-svgo",
    "chalk",
    "commander",
    "fast-glob",
    "jiti",
    "p-limit",
  ],
});
