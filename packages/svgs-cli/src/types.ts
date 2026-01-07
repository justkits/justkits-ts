import { Config } from "@svgr/core";

export type BuilderType = "family" | "standalone";

export interface SvgsConfig {
  /**
   * Type of builder to use.
   * - 'family': assets/[family]/[icon].svg -> src/[family]/components/[Icon].tsx
   * - 'standalone': assets/[icon].svg -> src/components/[Icon].tsx
   * @default 'standalone'
   */
  type?: BuilderType;

  /**
   * SVGR options
   */
  options?: Config;

  /**
   * Suffix to append to the component name
   * @default ""
   */
  suffix?: string;

  /**
   * Base directory for assets and src
   * @default process.cwd()
   */
  baseDir?: string;
}

export function defineConfig(config: SvgsConfig): SvgsConfig {
  return config;
}
