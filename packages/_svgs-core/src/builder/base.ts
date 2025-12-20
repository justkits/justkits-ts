import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { createHash } from "node:crypto";
import fg from "fast-glob";
import { Config, transform } from "@svgr/core";
import pLimit from "p-limit";

import { logger } from "@/logger";

export abstract class BaseSvgBuilder {
  protected readonly ASSETS_DIR: string;
  protected readonly SRC_DIR: string;

  protected readonly nameRegistry: Map<string, string>; // key: componentName, value: filePath (duplicate check)
  protected readonly contentRegistry: Map<string, string>; // key: contentHash, value: filePath (duplicate check)

  private readonly options: Config;
  private readonly baseDir: string;

  /**
   * Constructor to initialize paths and data structures
   */
  constructor(options: Config, baseDir: string) {
    this.baseDir = baseDir;
    this.ASSETS_DIR = resolve(this.baseDir, "assets");
    this.SRC_DIR = resolve(this.baseDir, "src");

    this.nameRegistry = new Map();
    this.contentRegistry = new Map();

    this.options = options;
  }

  /**
   * The main method to generate SVG components
   *   - Workflow: clean - process - generate barrels - print summary
   */
  public async generate(): Promise<void> {
    const startTime = performance.now();

    logger.detail("---------------------------------------------------\n");
    await this.clean();

    logger.success("Clean completed. Starting generation...\n");
    await this.processSvgs();

    logger.success("SVG processing completed. Generating barrel files...\n");
    await this.generateBarrelFiles();

    logger.success("Barrel files generated successfully.\n");
    this.printSummary();

    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    const count = this.nameRegistry.size;

    logger.success(
      `✨ [Success] Generated ${count} components in ${duration}s`,
    );
  }

  // ================================================== //
  // ============== Major Subprocesses ================ //
  // ================================================== //

  private async clean(): Promise<void> {
    const patterns = ["**/*.tsx", "**/index.ts"];
    const deletedPaths = await fg(patterns, {
      cwd: this.SRC_DIR,
      absolute: true,
      ignore: ["types.ts"], // Ensure types.ts is never deleted even if matched
    });

    for (const path of deletedPaths) {
      await rm(path, { force: true });
    }
  }

  private async processSvgs() {
    const svgFiles = await fg("**/*.svg", {
      cwd: this.ASSETS_DIR,
      absolute: true,
    });

    // Limit concurrency to prevent EMFILE errors and memory spikes
    const limit = pLimit(10);

    await Promise.all(
      svgFiles.map((file) =>
        limit(async () => {
          const fileName = basename(file, ".svg");

          // Kebab-case 검사
          if (!/^[a-z0-9-]+$/.test(fileName)) {
            throw new Error(
              `Invalid filename: "${fileName}". Filenames must be strictly kebab-case (e.g., "my-icon").`,
            );
          }

          const svgCode = await readFile(file, "utf-8");
          const componentName = this.kebabToPascal(fileName);
          this.duplicateNameCheck(componentName, file);

          const contentHash = createHash("sha512")
            .update(svgCode)
            .digest("hex");
          this.duplicateContentCheck(contentHash, file);

          // Register new component and content
          this.nameRegistry.set(componentName, file);
          this.contentRegistry.set(contentHash, file);

          const content = await transform(svgCode, this.options, {
            componentName,
          });

          await this.saveComponentFile(content, componentName, file);
        }),
      ),
    );
  }

  // ================================================== //
  // ================ Abstract Methods ================ //
  // ================================================== //

  protected abstract saveComponentFile(
    content: string,
    componentName: string,
    file?: string,
  ): Promise<void>;
  protected abstract generateBarrelFiles(): Promise<void>;
  protected abstract printSummary(): void;

  // ================================================== //
  // =============== Utility Methods ================== //
  // ================================================== //

  protected async atomicWrite(
    filePath: string,
    content: string,
  ): Promise<void> {
    const tempFilePath = `${filePath}.tmp`;

    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(tempFilePath, content, "utf-8");

    try {
      await rename(tempFilePath, filePath);
    } catch (error) {
      await rm(tempFilePath, { force: true });
      throw error;
    }
  }

  private duplicateNameCheck(componentName: string, file: string): void {
    if (this.nameRegistry.has(componentName)) {
      const existingPath = this.nameRegistry.get(componentName);
      logger.error(
        `Duplicate component name detected: ${componentName}\n` +
          ` - ${existingPath}\n` +
          ` - ${file}\n` +
          `Please rename one of the files to ensure unique component names.`,
      );

      throw new Error("Duplicate component names found.");
    }
  }

  private duplicateContentCheck(contentHash: string, file: string): void {
    if (this.contentRegistry.has(contentHash)) {
      const existingPath = this.contentRegistry.get(contentHash);
      logger.error(
        `Duplicate SVG content detected:\n` +
          ` - ${existingPath}\n` +
          ` - ${file}\n` +
          `These files contain identical SVG code. Please remove one or modify the content.`,
      );
      throw new Error("Duplicate SVG content found.");
    }
  }

  private kebabToPascal(str: string): string {
    return str
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  }
}
