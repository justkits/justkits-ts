import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";

import { TestAssetsManager } from "./setup/managers";
import { useTempDir } from "./setup/tempDir";

describe("AssetsBaseManager", () => {
  const testDir = useTempDir("assets-test");
  let manager: TestAssetsManager;

  beforeEach(() => {
    manager = new TestAssetsManager(testDir);
  });

  describe("assertScanned", () => {
    it("should throw if not scanned", () => {
      expect(() => manager.testAssertScanned()).toThrow(
        "Assets have not been scanned yet.",
      );
    });

    it("should not throw after scan", async () => {
      await manager.scan();

      expect(() => manager.testAssertScanned()).not.toThrow();
    });
  });

  describe("analyzeIconFile", () => {
    it("should return null and add warning for directories", async () => {
      const subDir = join(testDir, "subdir");
      mkdirSync(subDir);

      const result = await manager.testAnalyzeIconFile(subDir);

      expect(result).toBeNull();
      expect(manager.getWarnings()).toContain(
        `Directory provided instead of .svg file: ${subDir}`,
      );
    });

    it("should return null and add warning for non-SVG files", async () => {
      const pngFile = join(testDir, "icon.png");
      writeFileSync(pngFile, "fake png content");

      const result = await manager.testAnalyzeIconFile(pngFile);

      expect(result).toBeNull();
      expect(manager.getWarnings()).toContain(
        `Non-SVG file found in assets: ${pngFile}`,
      );
    });

    it("should return null and add error for non-kebab-case names", async () => {
      const invalidFile = join(testDir, "InvalidName.svg");
      writeFileSync(invalidFile, "<svg></svg>");

      const result = await manager.testAnalyzeIconFile(invalidFile);

      expect(result).toBeNull();
      expect(manager.getErrors()).toContain(
        `Icon files must be in kebab-case: ${invalidFile}`,
      );
    });

    it("should return metadata for valid SVG file", async () => {
      const svgFile = join(testDir, "valid-icon.svg");
      writeFileSync(svgFile, "<svg></svg>");

      const result = await manager.testAnalyzeIconFile(svgFile);

      expect(result).not.toBeNull();
      expect(result?.iconName).toBe("valid-icon");
      expect(result?.hash).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex
    });

    it("should accept single word kebab-case names", async () => {
      const svgFile = join(testDir, "icon.svg");
      writeFileSync(svgFile, "<svg></svg>");

      const result = await manager.testAnalyzeIconFile(svgFile);

      expect(result).not.toBeNull();
      expect(result?.iconName).toBe("icon");
    });

    it("should accept kebab-case names with numbers", async () => {
      const svgFile = join(testDir, "icon-2-test.svg");
      writeFileSync(svgFile, "<svg></svg>");

      const result = await manager.testAnalyzeIconFile(svgFile);

      expect(result).not.toBeNull();
      expect(result?.iconName).toBe("icon-2-test");
    });
  });

  describe("printSummary", () => {
    it("should throw if not scanned", () => {
      expect(() => manager.testPrintSummary()).toThrow(
        "Assets have not been scanned yet.",
      );
    });

    it("should not throw when no errors", async () => {
      await manager.scan();

      expect(() => manager.testPrintSummary()).not.toThrow();
    });

    it("should throw when there are errors", async () => {
      await manager.scan();
      manager.setErrors(["Some error"]);

      expect(() => manager.testPrintSummary()).toThrow(
        "Assets scan completed with errors.",
      );
    });

    it("should handle warnings without throwing", async () => {
      await manager.scan();
      manager.setWarnings(["Some warning"]);

      expect(() => manager.testPrintSummary()).not.toThrow();
    });
  });
});
