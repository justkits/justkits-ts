import { readdir } from "node:fs/promises";
import { relative } from "node:path";

import { logger } from "@lib/logger";

export type ComponentMeta = {
  componentName: string;
  relativePath: string;
};

export class ComponentsBaseManager {
  private SRC_DIR: string;

  private ALL_COMPONENTS: ComponentMeta[];

  private warnings: string[];
  private isScanned: boolean;

  constructor(srcDir: string) {
    this.SRC_DIR = srcDir;

    this.ALL_COMPONENTS = [];

    this.warnings = [];
    this.isScanned = false;
  }

  protected assertScanned() {
    if (!this.isScanned) {
      throw new Error("Components have not been scanned yet.");
    }
  }

  protected async scanDirectory(dir: string): Promise<void> {
    try {
      const files = await readdir(dir, { withFileTypes: true });

      for (const file of files) {
        // tsx파일이면 배열에 추가, 그렇지 않으면 warning에 추가
        if (file.isFile() && file.name.endsWith(".tsx")) {
          const componentName = file.name.replace(".tsx", "");
          const relativePath = relative(this.SRC_DIR, `${dir}/${file.name}`);

          this.ALL_COMPONENTS.push({ componentName, relativePath });
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
