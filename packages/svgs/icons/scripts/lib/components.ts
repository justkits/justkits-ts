import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { ComponentMeta, ComponentsBaseManager } from "@justkits/svgs-core";

import { PATHS } from "../config";

class IconComponentsManager extends ComponentsBaseManager {
  private componentsByFamilies: Record<string, ComponentMeta[]>;

  constructor(srcDir: string) {
    super(srcDir);
    this.componentsByFamilies = {};
  }

  protected async scanWebDirectory(): Promise<void> {
    const webDirents = await readdir(this.WEB_DIR, { withFileTypes: true });

    for (const dirent of webDirents) {
      if (!dirent.isDirectory()) {
        this.warnings.push(
          `Component family directory expected, but found file: ${dirent.name}`,
        );
        continue;
      }

      const familyName = dirent.name;
      const dir = resolve(this.WEB_DIR, familyName, "components");

      try {
        const components = await this.collectComponents(dir);
        this.componentsByFamilies[familyName] = components;
        this.allComponents.push(...components);
      } catch (error) {
        this.errors.push(
          `Failed to collect components for family ${familyName}: ${error}`,
        );
      }
    }

    this.isScanned = true;
  }

  public async updateAllBarrels(): Promise<void> {
    this.assertScanned();

    await this.updateRootBarrel();

    for (const familyName of Object.keys(this.componentsByFamilies)) {
      const components = this.componentsByFamilies[familyName];

      const lines: string[] = [];

      for (const component of components) {
        lines.push(
          `export { ${component.componentName} } from "./components/${component.componentName}";`,
        );
      }

      const content = lines.join("\n") + "\n";

      const relativePath = join(familyName, "index.ts");

      await this.save(relativePath, content);
    }
  }
}

export const componentsManager = new IconComponentsManager(PATHS.SRC);
