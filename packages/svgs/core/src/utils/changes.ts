import { AssetsMeta } from "../managers/assets";
import { SVGMetadata } from "../managers/database";
import { logger } from "@lib/logger";

export abstract class BaseChangesDetector<
  A extends AssetsMeta,
  M extends SVGMetadata,
> {
  protected iconNames: Record<string, string>; // iconName -> path
  protected iconHashes: Record<string, string>; // hash -> iconName

  protected toConvert: M[];
  protected toDelete: M[];

  protected addedCount: number;
  protected updatedCount: number;

  private readonly errors: string[];

  constructor() {
    this.iconNames = {};
    this.iconHashes = {};

    this.toConvert = [];
    this.toDelete = [];

    this.addedCount = 0;
    this.updatedCount = 0;

    this.errors = [];
  }

  protected abstract compareHash(svg: A): void;
  protected abstract detectDeletedSVGs(): void;

  public run(svgs: A[]): { toConvert: M[]; toDelete: M[] } {
    for (const svg of svgs) {
      this.validateAsset(svg);

      this.compareHash(svg);
    }

    this.detectDeletedSVGs();

    this.printSummary();

    return {
      toConvert: this.toConvert,
      toDelete: this.toDelete,
    };
  }

  private validateAsset(assetData: A): void {
    if (this.iconNames[assetData.iconName]) {
      const errorMsg =
        "[Validation Error] Duplicate name" +
        ` "${assetData.iconName}": Found at "${assetData.path}" and "${this.iconNames[assetData.iconName]}".`;
      this.errors.push(errorMsg);
    }

    if (this.iconHashes[assetData.hash]) {
      const errorMsg =
        "[Validation Error] Duplicate content: " +
        `Icon "${assetData.path}" is identical to "${this.iconHashes[assetData.hash]}".`;
      this.errors.push(errorMsg);
    }
  }

  protected kebabToPascal(str: string): string {
    return str
      .replaceAll(/[^a-zA-Z0-9]+(.)?/g, (_, char) =>
        char ? char.toUpperCase() : "",
      )
      .replaceAll(/^./g, (char) => char.toUpperCase());
  }

  private printSummary(): void {
    logger.info("=== Changes Detection Summary ===");
    logger.info(
      `${this.addedCount} new, ${this.updatedCount} updated, ${this.toDelete.length} deleted icons detected.`,
    );

    if (this.errors.length > 0) {
      logger.error("❌ Validation errors found:");
      for (const error of this.errors) {
        logger.error(`  - ${error}`);
      }
      throw new Error("Validation errors detected during changes detection.");
    } else {
      logger.success("✨ No validation errors found.");
    }

    logger.info("=================================");
  }
}
