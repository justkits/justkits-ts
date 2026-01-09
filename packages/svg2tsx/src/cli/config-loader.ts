import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createJiti } from "jiti";

import { SvgsConfig } from "./types";

const DEFAULT_FILE_PATH = "svg2tsx.config.ts";

export async function loadConfig(
  cwd: string = process.cwd(),
  explicitPath?: string,
): Promise<SvgsConfig> {
  let config: SvgsConfig | null = null;

  if (explicitPath) {
    const resolvedPath = resolve(cwd, explicitPath);
    config = await readConfigFile(cwd, resolvedPath);
  } else {
    const defaultPath = resolve(cwd, DEFAULT_FILE_PATH);
    config = await readConfigFile(cwd, defaultPath);
  }

  if (config) {
    return config;
  }

  // Return default config if no file found
  return {
    type: "standalone",
    baseDir: cwd,
  };
}

async function readConfigFile(
  cwd: string,
  filePath: string,
): Promise<SvgsConfig | null> {
  const jiti = createJiti(import.meta.url);

  if (existsSync(filePath)) {
    try {
      const mod = await jiti.import(filePath);
      // Handle default export if it exists
      const config = (mod as any).default || mod; // eslint-disable-line @typescript-eslint/no-explicit-any
      return {
        baseDir: cwd,
        ...config,
      };
    } catch (error) {
      throw new Error(`Failed to load config from ${filePath}: ${error}`);
    }
  }
  return null;
}
