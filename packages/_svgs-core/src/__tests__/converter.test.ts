import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";

import { TestSVGMetadata } from "./setup/managers";
import { useTempDir } from "./setup/tempDir";
import { TestConverter } from "./setup/utils";

describe("BaseConverter", () => {
  const testDir = useTempDir("converter-test");
  const assetsDir = join(testDir, "assets");
  const srcDir = join(testDir, "src");
  let converter: TestConverter;

  const sampleMeta: TestSVGMetadata = {
    path: "icon.svg",
    hash: "abc123",
    componentName: "Icon",
    iconName: "icon",
  };

  beforeEach(() => {
    mkdirSync(assetsDir, { recursive: true });
    mkdirSync(srcDir, { recursive: true });
    converter = new TestConverter(assetsDir, srcDir);
  });

  describe("constructor", () => {
    it("should set assetsPath and srcPath", () => {
      expect(converter["assetsPath"]).toBe(assetsDir);
      expect(converter["srcPath"]).toBe(srcDir);
    });
  });

  describe("defaultOptions", () => {
    it("should have correct default SVGR options", () => {
      const options = converter.getDefaultOptions();

      expect(options.icon).toBe(true);
      expect(options.typescript).toBe(true);
      expect(options.prettier).toBe(true);
      expect(options.jsxRuntime).toBe("automatic");
      expect(options.expandProps).toBe(false);
      expect(options.svgProps).toEqual({
        width: "{size}",
        height: "{size}",
        color: "{color}",
      });
    });
  });

  describe("runConvert", () => {
    it("should skip when no items to convert", async () => {
      await converter.runConvert([]);

      expect(converter.convertedItems).toHaveLength(0);
    });

    it("should convert all items", async () => {
      const items: TestSVGMetadata[] = [
        sampleMeta,
        { ...sampleMeta, iconName: "another", componentName: "Another" },
      ];

      await converter.runConvert(items);

      expect(converter.convertedItems).toHaveLength(2);
    });

    it("should throw when conversion fails", async () => {
      converter.shouldFailConvert = true;

      await expect(converter.runConvert([sampleMeta])).rejects.toThrow(
        "Conversion failed due to errors.",
      );
    });

    it("should collect all errors before throwing", async () => {
      converter.shouldFailConvert = true;
      const items: TestSVGMetadata[] = [
        sampleMeta,
        { ...sampleMeta, iconName: "another", componentName: "Another" },
      ];

      await expect(converter.runConvert(items)).rejects.toThrow(
        "Conversion failed due to errors.",
      );
    });

    it("should handle non-Error exceptions in convert", async () => {
      converter.shouldFailConvert = true;
      converter.throwNonError = true;

      await expect(converter.runConvert([sampleMeta])).rejects.toThrow(
        "Conversion failed due to errors.",
      );
    });
  });

  describe("runDelete", () => {
    it("should skip when no items to delete", async () => {
      await converter.runDelete([]);

      expect(converter.deletedItems).toHaveLength(0);
    });

    it("should delete all items", async () => {
      const items: TestSVGMetadata[] = [
        sampleMeta,
        { ...sampleMeta, iconName: "another", componentName: "Another" },
      ];

      await converter.runDelete(items);

      expect(converter.deletedItems).toHaveLength(2);
    });

    it("should throw when deletion fails", async () => {
      converter.shouldFailDelete = true;

      await expect(converter.runDelete([sampleMeta])).rejects.toThrow(
        "Conversion failed due to errors.",
      );
    });

    it("should handle non-Error exceptions in delete", async () => {
      converter.shouldFailDelete = true;
      converter.throwNonError = true;

      await expect(converter.runDelete([sampleMeta])).rejects.toThrow(
        "Conversion failed due to errors.",
      );
    });
  });

  describe("svg2tsx", () => {
    it("should transform SVG to TSX component", async () => {
      const svgContent = `<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>`;
      writeFileSync(join(assetsDir, "icon.svg"), svgContent);

      const result = await converter.testSvg2tsx("Icon", "icon.svg");

      expect(result).toContain("const Icon");
      expect(result).toContain("export default Icon");
    });

    it("should include size and color props", async () => {
      const svgContent = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>`;
      writeFileSync(join(assetsDir, "circle.svg"), svgContent);

      const result = await converter.testSvg2tsx("Circle", "circle.svg");

      expect(result).toContain("size");
      expect(result).toContain("color");
    });

    it("should preserve viewBox", async () => {
      const svgContent = `<svg viewBox="0 0 48 48"><rect width="48" height="48"/></svg>`;
      writeFileSync(join(assetsDir, "rect.svg"), svgContent);

      const result = await converter.testSvg2tsx("Rect", "rect.svg");

      expect(result).toContain("viewBox");
      expect(result).toContain("0 0 48 48");
    });

    it("should throw for non-existent file", async () => {
      await expect(
        converter.testSvg2tsx("Missing", "missing.svg"),
      ).rejects.toThrow();
    });
  });
});
