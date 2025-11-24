import { TestAssetsMeta, TestSVGMetadata } from "./managers";
import { BaseChangesDetector } from "@utils/changes";
import { BaseConverter } from "@utils/converter";

// ========================================== //
// ========= Changes Detector Setup ========= //
// ========================================== //

export class TestChangesDetector extends BaseChangesDetector<
  TestAssetsMeta,
  TestSVGMetadata
> {
  private dbIcons: Map<string, TestSVGMetadata> = new Map();

  setDbIcons(icons: TestSVGMetadata[]) {
    this.dbIcons = new Map(icons.map((icon) => [icon.iconName, icon]));
  }

  protected compareHash(svg: TestAssetsMeta): void {
    // Track the icon for duplicate detection
    this.iconNames[svg.iconName] = svg.path;
    this.iconHashes[svg.hash] = svg.iconName;

    const existing = this.dbIcons.get(svg.iconName);

    if (!existing) {
      // New icon
      this.addedCount++;
      this.toConvert.push({
        path: svg.path,
        hash: svg.hash,
        iconName: svg.iconName,
        componentName: this.kebabToPascal(svg.iconName),
      });
    } else if (existing.hash !== svg.hash) {
      // Updated icon
      this.updatedCount++;
      this.toConvert.push({
        path: svg.path,
        hash: svg.hash,
        iconName: svg.iconName,
        componentName: this.kebabToPascal(svg.iconName),
      });
    }
  }

  protected detectDeletedSVGs(): void {
    for (const [iconName, meta] of this.dbIcons) {
      if (!this.iconNames[iconName]) {
        this.toDelete.push(meta);
      }
    }
  }

  // Expose protected method for testing
  public testKebabToPascal(str: string) {
    return this.kebabToPascal(str);
  }
}

// ========================================== //
// ========== SVG Converter Setup =========== //
// ========================================== //

export class TestConverter extends BaseConverter<TestSVGMetadata> {
  public convertedItems: TestSVGMetadata[] = [];
  public deletedItems: TestSVGMetadata[] = [];
  public shouldFailConvert = false;
  public shouldFailDelete = false;
  public throwNonError = false;

  protected async convertOne(metadata: TestSVGMetadata): Promise<void> {
    if (this.shouldFailConvert) {
      if (this.throwNonError) {
        throw "string error";
      }
      throw new Error("Conversion failed");
    }
    this.convertedItems.push(metadata);
  }

  protected async deleteOne(metadata: TestSVGMetadata): Promise<void> {
    if (this.shouldFailDelete) {
      if (this.throwNonError) {
        throw "string error";
      }
      throw new Error("Deletion failed");
    }
    this.deletedItems.push(metadata);
  }

  // Expose protected methods for testing
  public testSvg2tsx(componentName: string, path: string) {
    return this.svg2tsx(componentName, path, this.defaultOptions);
  }

  public getDefaultOptions() {
    return this.defaultOptions;
  }
}
