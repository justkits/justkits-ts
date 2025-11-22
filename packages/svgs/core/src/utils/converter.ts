import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Config, transform } from "@svgr/core";
import jsxPlugin from "@svgr/plugin-jsx";
import svgoPlugin from "@svgr/plugin-svgo";

import { SVGMetadata } from "../managers/database";
import { logger } from "@lib/logger";
import { atomicWrite } from "@lib/storage";

type ConvertedSVG = {
  componentName: string;
  webCode: string;
  webFilePath: string;
  nativeCode: string;
  nativeFilePath: string;
};

export abstract class BaseConverter<T extends SVGMetadata> {
  protected assetsPath: string;
  protected srcPath: string;

  protected convertedSVGs: ConvertedSVG[];

  constructor(assetsPath: string, srcPath: string) {
    this.assetsPath = assetsPath;
    this.srcPath = srcPath;

    this.convertedSVGs = [];
  }

  protected abstract convertOne(metadata: T): Promise<void>;
  protected abstract deleteOne(metadata: T): Promise<void>;

  public async runConvert(toConvert: T[]): Promise<void> {
    if (toConvert.length === 0) {
      logger.info("✨ No icons to convert.");
      return;
    }

    // Convert all SVGs
    const conversionErrors: string[] = [];

    for (const item of toConvert) {
      try {
        await this.convertOne(item);
      } catch (error) {
        conversionErrors.push(
          `Failed during converting icon ${item.componentName}: ${error}`,
        );
      }
    }

    this.printErrors(conversionErrors);

    // Save all converted SVGs to files
    const saveErrors: string[] = [];

    for (const svg of this.convertedSVGs) {
      try {
        await atomicWrite(svg.webFilePath, svg.webCode);
        await atomicWrite(svg.nativeFilePath, svg.nativeCode);
      } catch (error) {
        saveErrors.push(
          `Failed during saving icon ${svg.componentName}: ${error}`,
        );
      }
    }

    this.printErrors(saveErrors);
  }

  public async runDelete(toDelete: T[]): Promise<void> {
    if (toDelete.length === 0) {
      logger.info("✨ No icons to delete.");
      return;
    }

    const deleteErrors: string[] = [];

    for (const item of toDelete) {
      try {
        await this.deleteOne(item);
      } catch (error) {
        deleteErrors.push(
          `Failed during deleting icon ${item.componentName}: ${error}`,
        );
      }
    }

    this.printErrors(deleteErrors);
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
    const relativePath = resolve(join(this.assetsPath, path));
    const svgContent = await readFile(relativePath, "utf-8");

    const componentCode = await transform(svgContent, options, {
      componentName,
    });

    return componentCode;
  }

  private printErrors(errors: string[]): void {
    if (errors.length > 0) {
      logger.error("❌ Errors found:");
      for (const error of errors) {
        logger.info(`  - ${error}`);
      }

      throw new Error("Conversion failed due to errors.");
    }
  }
}
