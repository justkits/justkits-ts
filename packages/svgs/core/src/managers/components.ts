import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { compare } from "dir-compare";

import { logger } from "@lib/logger";

export type ComponentMeta = {
  componentName: string;
  relativePath: string;
};

export abstract class ComponentsBaseManager {
  protected WEB_DIR: string;
  protected NATIVE_DIR: string;

  protected allComponents: ComponentMeta[];

  protected warnings: string[];
  protected isScanned: boolean;

  constructor(srcDir: string) {
    this.WEB_DIR = join(srcDir, "web");
    this.NATIVE_DIR = join(srcDir, "native");

    this.allComponents = [];

    this.warnings = [];
    this.isScanned = false;
  }

  protected abstract scanWebDirectory(): Promise<void>;

  public async scan(): Promise<void> {
    const result = await compare(this.WEB_DIR, this.NATIVE_DIR, {
      compareContent: false,
    });

    if (!result.same) {
      throw new Error(
        "Web and Native component directories are not synchronized.",
      );
    }

    await this.scanWebDirectory();
  }

  protected assertScanned() {
    if (!this.isScanned) {
      throw new Error("Components have not been scanned yet.");
    }
  }

  protected async collectComponents(dir: string): Promise<void> {
    try {
      const files = await readdir(dir, { withFileTypes: true });

      for (const file of files) {
        // tsx파일이면 배열에 추가, 그렇지 않으면 warning에 추가
        if (file.isFile() && file.name.endsWith(".tsx")) {
          const componentName = file.name.replace(".tsx", "");
          const relativePath = relative(this.WEB_DIR, `${dir}/${file.name}`);

          this.allComponents.push({ componentName, relativePath });
        } else {
          this.warnings.push(
            `TSX component file expected, but found: ${file.name} in directory ${dir}`,
          );
        }
      }
    } catch (error) {
      logger.error(`Failed to scan directory ${dir}: ${error}`);
    }
  }
}
