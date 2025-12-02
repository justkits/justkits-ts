import { readdir } from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { componentsManager } from "@scripts/lib/components";

interface ComponentMeta {
  componentName: string;
  path: string;
}

interface TestableComponentsManager {
  allComponents: ComponentMeta[];
  componentsByFamilies: Record<string, ComponentMeta[]>;
  isScanned: boolean;
  scanWebDirectory(): Promise<void>;
  collectComponents(dir: string): Promise<ComponentMeta[]>;
  updateAllBarrels(): Promise<void>;
  save(relativePath: string, content: string): Promise<void>;
  updateRootBarrel(): Promise<void>;
}

describe("IconComponentsManager", () => {
  const readdirMock = readdir as unknown as ReturnType<typeof vi.fn>;
  const testManager = componentsManager as unknown as TestableComponentsManager;

  beforeEach(() => {
    vi.clearAllMocks();
    readdirMock.mockReset();
    // Reset internal state since componentsManager is a singleton
    testManager.allComponents = [];
    testManager.componentsByFamilies = {};
    testManager.isScanned = false;
  });

  describe("scanWebDirectory", () => {
    it("should scan empty web directory", async () => {
      readdirMock.mockResolvedValue([]);

      await testManager.scanWebDirectory();

      expect(testManager.isScanned).toBe(true);
      expect(testManager.allComponents).toHaveLength(0);
      expect(testManager.componentsByFamilies).toEqual({});
    });

    it("should scan directories and collect components", async () => {
      readdirMock.mockResolvedValueOnce([
        {
          name: "app",
          isDirectory: () => true,
        },
      ]);

      const mockComponent = {
        componentName: "ChevronDown",
        path: "app/components/ChevronDown.tsx",
      };
      vi.spyOn(testManager, "collectComponents").mockResolvedValueOnce([
        mockComponent,
      ]);

      await testManager.scanWebDirectory();

      expect(testManager.isScanned).toBe(true);
      expect(testManager.allComponents).toHaveLength(1);
      expect(testManager.allComponents[0]).toEqual(mockComponent);
      expect(testManager.componentsByFamilies).toEqual({
        app: [mockComponent],
      });
      expect(readdirMock).toHaveBeenCalledWith("/mocked/path/src", {
        withFileTypes: true,
      });
      expect(vi.spyOn(testManager, "collectComponents")).toHaveBeenCalledWith(
        "/mocked/path/src/app/components",
      );
    });

    it("should skip non-directory entries in WEB_DIR", async () => {
      readdirMock.mockResolvedValueOnce([
        {
          name: "index.ts",
          isDirectory: () => false,
        },
        {
          name: "app",
          isDirectory: () => true,
        },
      ]);

      const mockComponent = {
        componentName: "ChevronUp",
        path: "app/components/ChevronUp.tsx",
      };
      vi.spyOn(testManager, "collectComponents").mockResolvedValueOnce([
        mockComponent,
      ]);

      await testManager.scanWebDirectory();

      expect(readdirMock).toHaveBeenCalledWith("/mocked/path/src", {
        withFileTypes: true,
      });
      expect(vi.spyOn(testManager, "collectComponents")).toHaveBeenCalledWith(
        "/mocked/path/src/app/components",
      );
    });
  });

  describe("updateAllBarrels", () => {
    it("should throw error if not scanned", async () => {
      await expect(testManager.updateAllBarrels()).rejects.toThrow(
        "Not scanned",
      );
    });

    it("should generate and save barrel files correctly", async () => {
      // Simulate a scanned state
      const mockComponentApp = {
        componentName: "ChevronDown",
        path: "app/components/ChevronDown.tsx",
      };
      const mockComponentMedia = {
        componentName: "Album",
        path: "media/components/Album.tsx",
      };

      testManager.isScanned = true;
      testManager.allComponents = [mockComponentApp, mockComponentMedia];
      testManager.componentsByFamilies = {
        app: [mockComponentApp],
        media: [mockComponentMedia],
      };

      const updateRootBarrelSpy = vi.spyOn(testManager, "updateRootBarrel");
      const saveSpy = vi.spyOn(testManager, "save");

      await componentsManager.updateAllBarrels();

      expect(updateRootBarrelSpy).toHaveBeenCalledTimes(1);
      expect(saveSpy).toHaveBeenCalledTimes(2); // One for each family

      expect(saveSpy).toHaveBeenCalledWith(
        "app/index.ts",
        'export { ChevronDown } from "./components/ChevronDown";\n',
      );
      expect(saveSpy).toHaveBeenCalledWith(
        "media/index.ts",
        'export { Album } from "./components/Album";\n',
      );
    });
  });
});
