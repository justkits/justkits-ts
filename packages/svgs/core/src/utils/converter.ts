import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Config, transform } from "@svgr/core";
import jsxPlugin from "@svgr/plugin-jsx";
import svgoPlugin from "@svgr/plugin-svgo";

import { SVGMetadata } from "../managers/database";
import { logger } from "@lib/logger";

export abstract class BaseConverter<T extends SVGMetadata> {
  protected assetsPath: string;
  protected srcPath: string;

  constructor(assetsPath: string, srcPath: string) {
    this.assetsPath = assetsPath;
    this.srcPath = srcPath;
  }

  protected abstract convertOne(metadata: T): Promise<void>;
  protected abstract deleteOne(metadata: T): Promise<void>;

  public async runConvert(toConvert: T[]): Promise<void> {
    if (toConvert.length === 0) {
      logger.info("✨ No icons to convert.");
      return;
    }

    const errors: string[] = [];

    for (const item of toConvert) {
      try {
        await this.convertOne(item);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`Failed to convert ${item.componentName}: ${message}`);
      }
    }

    this.printErrors(errors);
  }

  public async runDelete(toDelete: T[]): Promise<void> {
    if (toDelete.length === 0) {
      logger.info("✨ No icons to delete.");
      return;
    }

    const errors: string[] = [];

    for (const item of toDelete) {
      try {
        await this.deleteOne(item);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`Failed to delete ${item.componentName}: ${message}`);
      }
    }

    this.printErrors(errors);
  }

  protected defaultOptions: Config = {
    icon: true,
    typescript: true,
    prettier: true,
    jsxRuntime: "automatic",
    expandProps: false,
    plugins: [svgoPlugin, jsxPlugin],
    svgProps: {
      width: "{size}",
      height: "{size}",
      color: "{color}",
    },
    svgoConfig: {
      plugins: [
        {
          name: "preset-default",
          params: { overrides: { removeViewBox: false } },
        },
      ],
    },
  };

  protected async svg2tsx(
    componentName: string,
    path: string,
    options: Config,
  ): Promise<string> {
    const filePath = join(this.assetsPath, path);
    const svgContent = await readFile(filePath, "utf-8");

    const componentCode = await transform(svgContent, options, {
      componentName,
    });

    return componentCode;
  }

  private printErrors(errors: string[]): void {
    if (errors.length > 0) {
      logger.error("❌ Errors found:");
      for (const error of errors) {
        logger.error(`  - ${error}`);
      }

      throw new Error("Conversion failed due to errors.");
    }
  }
}
