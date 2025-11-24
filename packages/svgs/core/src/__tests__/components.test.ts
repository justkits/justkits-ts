import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";

import { TestComponentsManager } from "./setup/managers";
import { useTempDir } from "./setup/tempDir";

describe("ComponentsBaseManager", () => {
  const testDir = useTempDir("components-test");
  const srcDir = join(testDir, "src");
  let manager: TestComponentsManager;

  beforeEach(() => {
    manager = new TestComponentsManager(srcDir);
  });

  describe("constructor", () => {
    it("should set up WEB_DIR and NATIVE_DIR paths", () => {
      expect(manager.getWebDir()).toBe(join(srcDir, "web"));
      expect(manager.getNativeDir()).toBe(join(srcDir, "native"));
    });
  });

  describe("scan", () => {
    it("should create both directories when neither exists", async () => {
      await manager.scan();

      expect(existsSync(manager.getWebDir())).toBe(true);
      expect(existsSync(manager.getNativeDir())).toBe(true);
    });

    it("should throw when only web directory exists", async () => {
      mkdirSync(manager.getWebDir(), { recursive: true });

      await expect(manager.scan()).rejects.toThrow(
        "Component directories are not synchronized: native/ missing",
      );
    });

    it("should throw when only native directory exists", async () => {
      mkdirSync(manager.getNativeDir(), { recursive: true });

      await expect(manager.scan()).rejects.toThrow(
        "Component directories are not synchronized: web/ missing",
      );
    });

    it("should succeed when both directories are synchronized", async () => {
      mkdirSync(manager.getWebDir(), { recursive: true });
      mkdirSync(manager.getNativeDir(), { recursive: true });

      await expect(manager.scan()).resolves.not.toThrow();
    });

    it("should throw when directories are not synchronized", async () => {
      mkdirSync(manager.getWebDir(), { recursive: true });
      mkdirSync(manager.getNativeDir(), { recursive: true });
      writeFileSync(join(manager.getWebDir(), "extra.ts"), "content");

      await expect(manager.scan()).rejects.toThrow(
        "Web and Native component directories are not synchronized.",
      );
    });
  });

  describe("assertScanned", () => {
    it("should throw if not scanned", () => {
      expect(() => manager.testAssertScanned()).toThrow(
        "Components have not been scanned yet.",
      );
    });

    it("should not throw after scan", async () => {
      await manager.scan();

      expect(() => manager.testAssertScanned()).not.toThrow();
    });
  });

  describe("save", () => {
    it("should save content to both web and native directories", async () => {
      mkdirSync(manager.getWebDir(), { recursive: true });
      mkdirSync(manager.getNativeDir(), { recursive: true });

      await manager.testSave("test.ts", "test content");

      expect(readFileSync(join(manager.getWebDir(), "test.ts"), "utf-8")).toBe(
        "test content",
      );
      expect(
        readFileSync(join(manager.getNativeDir(), "test.ts"), "utf-8"),
      ).toBe("test content");
    });
  });

  describe("collectComponents", () => {
    it("should return empty array for empty directory", async () => {
      mkdirSync(manager.getWebDir(), { recursive: true });

      const components = await manager.testCollectComponents(
        manager.getWebDir(),
      );

      expect(components).toEqual([]);
    });

    it("should collect tsx files as components", async () => {
      mkdirSync(manager.getWebDir(), { recursive: true });
      writeFileSync(
        join(manager.getWebDir(), "Icon.tsx"),
        "export function Icon() {}",
      );
      writeFileSync(
        join(manager.getWebDir(), "Button.tsx"),
        "export function Button() {}",
      );

      const components = await manager.testCollectComponents(
        manager.getWebDir(),
      );

      expect(components).toHaveLength(2);
      expect(components).toContainEqual({
        componentName: "Icon",
        relativePath: "Icon",
      });
      expect(components).toContainEqual({
        componentName: "Button",
        relativePath: "Button",
      });
    });

    it("should ignore non-tsx files", async () => {
      mkdirSync(manager.getWebDir(), { recursive: true });
      writeFileSync(
        join(manager.getWebDir(), "Icon.tsx"),
        "export function Icon() {}",
      );
      writeFileSync(
        join(manager.getWebDir(), "index.ts"),
        "export * from './Icon';",
      );
      writeFileSync(
        join(manager.getWebDir(), "types.d.ts"),
        "export type Props = {};",
      );

      const components = await manager.testCollectComponents(
        manager.getWebDir(),
      );

      expect(components).toHaveLength(1);
      expect(components[0].componentName).toBe("Icon");
    });

    it("should handle nested directories with relative paths", async () => {
      const nestedDir = join(manager.getWebDir(), "nested");
      mkdirSync(nestedDir, { recursive: true });
      writeFileSync(
        join(nestedDir, "NestedIcon.tsx"),
        "export function NestedIcon() {}",
      );

      const components = await manager.testCollectComponents(nestedDir);

      expect(components).toHaveLength(1);
      expect(components[0].componentName).toBe("NestedIcon");
      expect(components[0].relativePath).toBe("nested/NestedIcon");
    });
  });

  describe("updateRootBarrel", () => {
    it("should throw if not scanned", async () => {
      await expect(manager.updateRootBarrel()).rejects.toThrow(
        "Components have not been scanned yet.",
      );
    });

    it("should generate barrel file with exports", async () => {
      mkdirSync(manager.getWebDir(), { recursive: true });
      mkdirSync(manager.getNativeDir(), { recursive: true });
      manager.setScanned(true);
      manager.setAllComponents([
        { componentName: "Icon", relativePath: "Icon" },
        { componentName: "Button", relativePath: "components/Button" },
      ]);

      await manager.updateRootBarrel();

      const webContent = readFileSync(
        join(manager.getWebDir(), "index.ts"),
        "utf-8",
      );
      expect(webContent).toContain('export { Icon } from "./Icon";');
      expect(webContent).toContain(
        'export { Button } from "./components/Button";',
      );
      expect(webContent).toContain(
        'export type { IconProps } from "@icons/types";',
      );

      const nativeContent = readFileSync(
        join(manager.getNativeDir(), "index.ts"),
        "utf-8",
      );
      expect(nativeContent).toBe(webContent);
    });
  });
});
