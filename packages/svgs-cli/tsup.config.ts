import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/generate.ts"],
  format: ["esm"],
  dts: {
    entry: "src/index.ts",
  },
  tsconfig: "./tsconfig.build.json",
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: true,
  treeshake: true,
  // Shebang(#!/usr/bin/env node)을 보존합니다.
  banner: {
    js: "#!/usr/bin/env node",
  },
});
