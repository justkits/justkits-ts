import { Dirent } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { AssetsMeta, AssetsBaseManager } from "@justkits/svgs-core";

import { PATHS } from "@scripts/config";

export type IconAsset = AssetsMeta & {
  family: string;
};

class AssetsManager extends AssetsBaseManager<IconAsset> {
  public async scan(): Promise<IconAsset[]> {
    const dirents = await readdir(this.ASSETS_DIR, { withFileTypes: true });

    for (const dir of dirents) {
      if (!dir.isDirectory()) {
        this.errors.push(
          `Family directory expected, but found file: ${dir.name}`,
        );
        continue;
      }

      await this.scanFamilyDir(dir);
    }

    this.isScanned = true;
    this.printSummary();

    return this.svgs;
  }

  private async scanFamilyDir(dir: Dirent) {
    const familyName = dir.name;
    const familyPath = join(this.ASSETS_DIR, familyName);
    const iconFiles = await readdir(familyPath, { withFileTypes: true });

    for (const iconFile of iconFiles) {
      const iconPath = join(familyPath, iconFile.name);

      const result = await this.analyzeIconFile(iconPath);

      if (result) {
        const relativePath = relative(this.ASSETS_DIR, iconPath);
        this.svgs.push({
          path: relativePath,
          hash: result.hash,
          iconName: result.iconName,
          family: familyName,
        });
      }
    }
  }
}

export const assetsManager = new AssetsManager(PATHS.ASSETS);
