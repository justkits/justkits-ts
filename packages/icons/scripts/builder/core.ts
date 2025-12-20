import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { Config } from "@svgr/core";
import { BaseSvgBuilder, logger } from "@justkits/svgs-core";

export class IconsBuilder extends BaseSvgBuilder {
  private readonly exportMap: Record<string, string[]>; // key: familyName, value: componentNames[]

  constructor(options: Config, typesContent: string) {
    super(
      options,
      join(dirname(fileURLToPath(import.meta.url)), "../.."),
      typesContent,
    );
    this.exportMap = {};
  }

  protected printSummary(): void {
    const summaryData = Object.keys(this.exportMap)
      .sort((a, b) => a.localeCompare(b))
      .map((familyName) => ({
        Family: familyName,
        Count: this.exportMap[familyName].length,
        Status: "✅ OK",
      }));

    logger.detail("📊 Conversion Summary:");
    console.table(summaryData);
  }

  protected async saveComponentFile(
    content: string,
    componentName: string,
    file: string,
  ): Promise<void> {
    const familyName = relative(this.ASSETS_DIR, dirname(file));

    if (!familyName || familyName === ".") {
      throw new Error(
        `Icon "${basename(file)}" must be placed inside a category folder (e.g., assets/media/${basename(file)}).`,
      );
    }

    await this.atomicWrite(
      join(this.SRC_DIR, familyName, `components/${componentName}.tsx`),
      content,
    );
    if (!this.exportMap[familyName]) {
      this.exportMap[familyName] = [];
    }
    this.exportMap[familyName].push(componentName);
    logger.success(`Generated: ${familyName}/${componentName}`);
  }

  protected async generateBarrelFiles(): Promise<void> {
    const rootBarrelLines: string[] = [];
    const sortedFamilyNames = Object.keys(this.exportMap).sort((a, b) =>
      a.localeCompare(b),
    );

    for (const familyName of sortedFamilyNames) {
      const componentNames = this.exportMap[familyName];
      componentNames.sort((a, b) => a.localeCompare(b));
      const familyBarrelLines: string[] = [];

      for (const componentName of componentNames) {
        familyBarrelLines.push(
          `export { ${componentName} } from "./components/${componentName}";`,
        );
      }
      rootBarrelLines.push(
        `export { ${componentNames.join(", ")} } from "./${familyName}";`,
      );
      const familyBarrelContent = familyBarrelLines.join("\n") + "\n";

      await this.atomicWrite(
        join(this.SRC_DIR, familyName, "index.ts"),
        familyBarrelContent,
      );
    }

    const rootBarrelContent = rootBarrelLines.join("\n") + "\n";
    await this.atomicWrite(join(this.SRC_DIR, "index.ts"), rootBarrelContent);
  }
}
