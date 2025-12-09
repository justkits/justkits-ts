import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { performance } from "node:perf_hooks";
import fg from "fast-glob";
import { Config, transform } from "@svgr/core";

import { logger } from "./logger";

export type Options = {
  WEB: Config;
  NATIVE: Config;
};

export abstract class BaseSvgBuilder {
  protected readonly ASSETS_DIR: string;
  protected readonly SRC_DIR: string;

  protected readonly registry: Map<string, string>; // key: componentName, value: filePath (중복 검사용)

  private readonly options: Options;
  private readonly baseDir: string;

  /**
   * Constructor to initialize paths and data structures
   */
  constructor(options: Options, baseDir: string) {
    this.baseDir = baseDir;
    this.ASSETS_DIR = resolve(this.baseDir, "assets");
    this.SRC_DIR = resolve(this.baseDir, "src");

    this.registry = new Map();

    this.options = options;
  }

  // ================================================== //
  // ================ Public Methods ================== //
  // ================================================== //

  /**
   * The main method to generate SVG components
   *   - Workflow: clean - process - generate barrels - print summary
   */
  public async generate(): Promise<void> {
    const startTime = performance.now();

    logger.detail("---------------------------------------------------\n");
    await this.clean(false);

    logger.success("Clean completed. Starting generation...\n");
    await this.processSvgs();

    logger.success("SVG processing completed. Generating barrel files...\n");
    await this.generateBarrelFiles();

    logger.success("Barrel files generated successfully.\n");
    this.printSummary();

    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    const count = this.registry.size;

    logger.success(
      `✨ [Success] Generated ${count} components in ${duration}s`,
    );
  }

  /**
   * Cleanup method to remove previous build artifacts
   * @param verbose - Whether to log details during cleanup (default: true)
   */
  public async clean(verbose = true): Promise<void> {
    const pathsToRemove = [
      join(this.SRC_DIR, "web"),
      join(this.SRC_DIR, "native"),
    ];
    for (const path of pathsToRemove) {
      await rm(path, { recursive: true, force: true });

      if (verbose) {
        logger.detail(`- Removed: ${path}`);
      }
    }
  }

  // ================================================== //
  // ============== Major Subprocesses ================ //
  // ================================================== //

  private async processSvgs() {
    const svgFiles = await fg("**/*.svg", {
      cwd: this.ASSETS_DIR,
      absolute: true,
    });

    await Promise.all(
      svgFiles.map(async (file) => {
        const fileName = basename(file, ".svg");

        if (!/^[a-z0-9-]+$/.test(fileName)) {
          throw new Error(
            `Invalid filename: "${fileName}". Filenames must be strictly kebab-case (e.g., "my-icon").`,
          );
        }

        const svgCode = await readFile(file, "utf-8");
        const componentName = this.kebabToPascal(fileName);

        if (this.registry.has(componentName)) {
          const existingPath = this.registry.get(componentName);
          logger.error(
            `Duplicate component name detected: ${componentName}\n` +
              ` - ${existingPath}\n` +
              ` - ${file}\n` +
              `Please rename one of the files to ensure unique component names.`,
          );

          throw new Error("Duplicate component names found.");
        }

        // 오류가 발생하지 않은 경우 처리
        this.registry.set(componentName, file);

        const { webCode, nativeCode } = await this.svg2tsx(
          svgCode,
          componentName,
        );

        await this.saveComponentFile(webCode, nativeCode, componentName, file);
      }),
    );
  }

  // ================================================== //
  // ================ Abstract Methods ================ //
  // ================================================== //

  protected abstract saveComponentFile(
    webCode: string,
    nativeCode: string,
    componentName: string,
    file: string,
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
    await rename(tempFilePath, filePath);
  }

  private kebabToPascal(str: string): string {
    return str
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  }

  private async svg2tsx(
    svgCode: string,
    componentName: string,
  ): Promise<{ webCode: string; nativeCode: string }> {
    // receives svgCode (raw SVG), componentName and template as parameters
    // and converts SVG to TSX for web and native, separately
    // and returns an object containing webCode and nativeCode

    const webCode = await transform(svgCode, this.options.WEB, {
      componentName,
    });

    const nativeCode = await transform(svgCode, this.options.NATIVE, {
      componentName,
    });

    return { webCode, nativeCode };
  }
}
