import { BaseChangesDetector } from "@justkits/svgs-core";

import { IconAsset } from "../lib/assets";
import { databaseManager, IconMetadata } from "../lib/database";

class ChangesDetector extends BaseChangesDetector<IconAsset, IconMetadata> {
  protected compareHash(svg: IconAsset) {
    const oldIcon = databaseManager.get(svg.iconName);

    if (!oldIcon) {
      // NEW
      this.added.push({
        family: svg.family,
        componentName: this.kebabToPascal(svg.iconName),
        iconName: svg.iconName,
        hash: svg.hash,
        path: svg.path,
      });
    } else if (oldIcon.hash !== svg.hash) {
      // UPDATED
      this.updated.push({
        family: svg.family,
        componentName: this.kebabToPascal(svg.iconName),
        iconName: svg.iconName,
        path: svg.path,
        hash: svg.hash,
      });
    }

    this.iconNames[svg.iconName] = svg.path;
    this.iconHashes[svg.hash] = svg.iconName;
  }

  protected detectDeletedSVGs() {
    const allExistingIcons = databaseManager.getAll();

    for (const icon of allExistingIcons) {
      if (!this.iconNames[icon.iconName]) {
        // DELETED
        this.deleted.push(icon);
      }
    }
  }
}

export const changesDetector = new ChangesDetector();
