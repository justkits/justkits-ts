import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { createJiti } from "jiti";

import { SvgsConfig } from "./types";

const CONFIG_FILES = [
  "svg.config.ts",
  "svg.config.js",
  "svg.config.mjs",
  "svg.config.cjs",
];

export async function loadConfig(
  cwd: string = process.cwd(),
  explicitPath?: string,
): Promise<SvgsConfig> {
  const jiti = createJiti(import.meta.url);

  if (explicitPath) {
    const configPath = resolve(cwd, explicitPath);
    if (existsSync(configPath)) {
      try {
        const mod = await jiti.import(configPath);
        // Handle default export if it exists
        const config = (mod as any).default || mod; // eslint-disable-line @typescript-eslint/no-explicit-any
        return {
          baseDir: cwd,
          ...config,
        };
      } catch (error) {
        throw new Error(`Failed to load config from ${configPath}: ${error}`);
      }
    } else {
      throw new Error(`Config file not found: ${configPath}`);
    }
  }

  for (const file of CONFIG_FILES) {
    const configPath = join(cwd, file);
    if (existsSync(configPath)) {
      try {
        const mod = await jiti.import(configPath);
        // Handle default export if it exists
        const config = (mod as any).default || mod; // eslint-disable-line @typescript-eslint/no-explicit-any
        return {
          baseDir: cwd,
          ...config,
        };
      } catch (error) {
        throw new Error(`Failed to load config from ${configPath}: ${error}`);
      }
    }
  }

  // Return default config if no file found
  return {
    type: "standalone",
    baseDir: cwd,
  };
}
