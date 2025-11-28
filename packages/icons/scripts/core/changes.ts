import { BaseChangesDetector } from "@justkits/svgs-core";

import { IconAsset } from "../lib/assets";
import { databaseManager, IconMetadata } from "../lib/database";

class ChangesDetector extends BaseChangesDetector<IconAsset, IconMetadata> {
  protected compareHash(svg: IconAsset) {
    const oldIcon = databaseManager.get(svg.iconName);

    const metadata: IconMetadata = {
      family: svg.family,
      componentName: this.kebabToPascal(svg.iconName),
      iconName: svg.iconName,
      hash: svg.hash,
      path: svg.path,
    };

    if (!oldIcon) {
      this.toConvert.push(metadata);
      this.addedCount++;
    } else if (oldIcon.hash !== svg.hash) {
      this.toConvert.push(metadata);
      this.updatedCount++;
    }

    this.iconNames[svg.iconName] = svg.path;
    this.iconHashes[svg.hash] = svg.iconName;
  }

  protected detectDeletedSVGs() {
    const allExistingIcons = databaseManager.getAll();

    for (const icon of allExistingIcons) {
      if (!this.iconNames[icon.iconName]) {
        this.toDelete.push(icon);
      }
    }
  }
}

export const changesDetector = new ChangesDetector();
