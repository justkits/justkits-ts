import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { basename, extname } from "node:path";

export interface AssetsMeta {
  path: string; // svg 파일 경로
  hash: string;
  iconName: string; // kebab-case
}

const KEBAB_CASE_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export class AssetsBaseManager<T extends AssetsMeta> {
  private ASSETS_DIR: string;

  private svgs: T[];

  private warnings: string[];
  private errors: string[];
  private isScanned: boolean;

  constructor(assetsDir: string) {
    this.ASSETS_DIR = assetsDir;

    this.svgs = [];
    this.warnings = [];
    this.errors = [];
    this.isScanned = false;
  }

  protected assertScanned() {
    if (!this.isScanned) {
      throw new Error("Assets have not been scanned yet.");
    }
  }

  protected async analyzeIconFile(filePath: string): Promise<string | null> {
    this.assertScanned();

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

    return createHash("sha256").update(fileBuffer).digest("hex");
  }
}
