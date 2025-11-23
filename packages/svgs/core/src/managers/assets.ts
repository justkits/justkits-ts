import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { basename, extname } from "node:path";

import { logger } from "@lib/logger";

export interface AssetsMeta {
  path: string; // svg 파일 경로
  hash: string;
  iconName: string; // kebab-case
}

const KEBAB_CASE_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export abstract class AssetsBaseManager<T extends AssetsMeta> {
  protected ASSETS_DIR: string;

  protected svgs: T[];

  protected warnings: string[];
  protected errors: string[];
  protected isScanned: boolean;

  constructor(assetsDir: string) {
    this.ASSETS_DIR = assetsDir;

    this.svgs = [];
    this.warnings = [];
    this.errors = [];
    this.isScanned = false;
  }

  abstract scan(): Promise<T[]>;

  protected assertScanned() {
    if (!this.isScanned) {
      throw new Error("Assets have not been scanned yet.");
    }
  }

  protected async analyzeIconFile(
    filePath: string,
  ): Promise<Omit<AssetsMeta, "path"> | null> {
    const iconStat = await stat(filePath);

    if (iconStat.isDirectory()) {
      this.warnings.push(
        `Directory provided instead of .svg file: ${filePath}`,
      );
      return null;
    }

    if (extname(filePath) !== ".svg") {
      this.warnings.push(`Non-SVG file found in assets: ${filePath}`);
      return null;
    }

    const iconName = basename(filePath, ".svg");

    if (!KEBAB_CASE_REGEX.test(iconName)) {
      this.errors.push(`Icon files must be in kebab-case: ${filePath}`);
      return null;
    }

    const fileBuffer = await readFile(filePath);
    const hash = createHash("sha256").update(fileBuffer).digest("hex");

    return {
      hash,
      iconName,
    };
  }

  protected printSummary() {
    this.assertScanned();

    logger.info("=== Assets Scan Summary ===");
    logger.success(`Detected ${this.svgs.length} SVG files.`);

    if (this.warnings.length > 0) {
      logger.warn(`(${this.warnings.length}) Warnings:`);
      for (const warning of this.warnings) {
        logger.warn(`  - ${warning}`);
      }
    } else {
      logger.success("No warnings detected.");
    }

    if (this.errors.length > 0) {
      logger.error(`(${this.errors.length}) Errors:`);
      for (const error of this.errors) {
        logger.error(`  - ${error}`);
      }
      throw new Error("Assets scan completed with errors.");
    } else {
      logger.success("No errors detected.");
    }

    logger.info("===========================");
  }
}
