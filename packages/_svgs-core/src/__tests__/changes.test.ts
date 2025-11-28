import { describe, expect, it } from "vitest";

import { TestAssetsMeta } from "./setup/managers";
import { TestChangesDetector } from "./setup/utils";

describe("BaseChangesDetector", () => {
  describe("kebabToPascal", () => {
    it("should convert simple kebab-case to PascalCase", () => {
      const detector = new TestChangesDetector();

      expect(detector.testKebabToPascal("hello-world")).toBe("HelloWorld");
    });

    it("should handle single word", () => {
      const detector = new TestChangesDetector();

      expect(detector.testKebabToPascal("icon")).toBe("Icon");
    });

    it("should handle multiple hyphens", () => {
      const detector = new TestChangesDetector();

      expect(detector.testKebabToPascal("my-cool-icon")).toBe("MyCoolIcon");
    });

    it("should handle numbers", () => {
      const detector = new TestChangesDetector();

      expect(detector.testKebabToPascal("icon-2")).toBe("Icon2");
      expect(detector.testKebabToPascal("arrow-left-2")).toBe("ArrowLeft2");
    });

    it("should handle trailing hyphen", () => {
      const detector = new TestChangesDetector();

      expect(detector.testKebabToPascal("icon-")).toBe("Icon");
    });

    it("should handle multiple trailing special chars", () => {
      const detector = new TestChangesDetector();

      expect(detector.testKebabToPascal("icon--")).toBe("Icon");
    });
  });

  describe("run", () => {
    it("should detect new icons", () => {
      const detector = new TestChangesDetector();
      const svgs: TestAssetsMeta[] = [
        { path: "app/icon.svg", hash: "abc123", iconName: "icon" },
      ];

      const result = detector.run(svgs);

      expect(result.toConvert).toHaveLength(1);
      expect(result.toConvert[0].iconName).toBe("icon");
      expect(result.toConvert[0].componentName).toBe("Icon");
      expect(result.toDelete).toHaveLength(0);
    });

    it("should detect updated icons", () => {
      const detector = new TestChangesDetector();
      detector.setDbIcons([
        {
          path: "app/icon.svg",
          hash: "oldhash",
          iconName: "icon",
          componentName: "Icon",
        },
      ]);
      const svgs: TestAssetsMeta[] = [
        { path: "app/icon.svg", hash: "newhash", iconName: "icon" },
      ];

      const result = detector.run(svgs);

      expect(result.toConvert).toHaveLength(1);
      expect(result.toConvert[0].hash).toBe("newhash");
      expect(result.toDelete).toHaveLength(0);
    });

    it("should detect deleted icons", () => {
      const detector = new TestChangesDetector();
      detector.setDbIcons([
        {
          path: "app/old-icon.svg",
          hash: "abc123",
          iconName: "old-icon",
          componentName: "OldIcon",
        },
      ]);
      const svgs: TestAssetsMeta[] = [];

      const result = detector.run(svgs);

      expect(result.toConvert).toHaveLength(0);
      expect(result.toDelete).toHaveLength(1);
      expect(result.toDelete[0].iconName).toBe("old-icon");
    });

    it("should skip unchanged icons", () => {
      const detector = new TestChangesDetector();
      detector.setDbIcons([
        {
          path: "app/icon.svg",
          hash: "samehash",
          iconName: "icon",
          componentName: "Icon",
        },
      ]);
      const svgs: TestAssetsMeta[] = [
        { path: "app/icon.svg", hash: "samehash", iconName: "icon" },
      ];

      const result = detector.run(svgs);

      expect(result.toConvert).toHaveLength(0);
      expect(result.toDelete).toHaveLength(0);
    });

    it("should throw on duplicate icon names", () => {
      const detector = new TestChangesDetector();
      const svgs: TestAssetsMeta[] = [
        { path: "app/icon.svg", hash: "hash1", iconName: "icon" },
        { path: "media/icon.svg", hash: "hash2", iconName: "icon" },
      ];

      expect(() => detector.run(svgs)).toThrow(
        "Validation errors detected during changes detection.",
      );
    });

    it("should throw on duplicate icon content", () => {
      const detector = new TestChangesDetector();
      const svgs: TestAssetsMeta[] = [
        { path: "app/icon-a.svg", hash: "samehash", iconName: "icon-a" },
        { path: "app/icon-b.svg", hash: "samehash", iconName: "icon-b" },
      ];

      expect(() => detector.run(svgs)).toThrow(
        "Validation errors detected during changes detection.",
      );
    });

    it("should handle mixed operations", () => {
      const detector = new TestChangesDetector();
      detector.setDbIcons([
        {
          path: "app/unchanged.svg",
          hash: "hash1",
          iconName: "unchanged",
          componentName: "Unchanged",
        },
        {
          path: "app/updated.svg",
          hash: "oldhash",
          iconName: "updated",
          componentName: "Updated",
        },
        {
          path: "app/deleted.svg",
          hash: "hash3",
          iconName: "deleted",
          componentName: "Deleted",
        },
      ]);
      const svgs: TestAssetsMeta[] = [
        { path: "app/unchanged.svg", hash: "hash1", iconName: "unchanged" },
        { path: "app/updated.svg", hash: "newhash", iconName: "updated" },
        { path: "app/new-icon.svg", hash: "hash4", iconName: "new-icon" },
      ];

      const result = detector.run(svgs);

      expect(result.toConvert).toHaveLength(2); // updated + new
      expect(result.toDelete).toHaveLength(1); // deleted
      expect(result.toConvert.map((c) => c.iconName)).toContain("updated");
      expect(result.toConvert.map((c) => c.iconName)).toContain("new-icon");
      expect(result.toDelete[0].iconName).toBe("deleted");
    });
  });
});
