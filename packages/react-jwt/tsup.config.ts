import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
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
  external: ["react", "axios", "@tanstack/react-query"],
});
