import { join } from "node:path";
import { Config } from "@svgr/core";

import { BaseSvgBuilder } from "./base";
import { logger } from "@/logger";

export class StandaloneSvgBuilder extends BaseSvgBuilder {
  constructor(options: Config, baseDir: string) {
    super(options, baseDir);
  }

  protected printSummary(): void {
    const summaryData = Array.from(this.nameRegistry.keys())
      .sort((a, b) => a.localeCompare(b))
      .map((componentName) => ({
        Component: componentName,
        Status: "✅ OK",
      }));

    logger.detail("📊 Conversion Summary:");
    console.table(summaryData);
  }

  protected async generateBarrelFiles(): Promise<void> {
    const barrelLines: string[] = [];
    const sortedComponentNames = Array.from(this.nameRegistry.keys()).sort(
      (a, b) => a.localeCompare(b),
    );

    for (const componentName of sortedComponentNames) {
      barrelLines.push(
        `export { ${componentName} } from "./components/${componentName}";`,
      );
    }

    const barrelContent = barrelLines.join("\n") + "\n";
    await this.atomicWrite(join(this.SRC_DIR, "index.ts"), barrelContent);
  }

  protected async saveComponentFile(
    content: string,
    componentName: string,
  ): Promise<void> {
    const componentDir = join(this.SRC_DIR, "components");
    const componentPath = join(componentDir, `${componentName}.tsx`);

    await this.atomicWrite(componentPath, content);
    logger.info(`Generated: ${componentName}`);
  }
}
