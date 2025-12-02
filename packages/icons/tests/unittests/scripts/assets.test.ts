import { readdir } from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { assetsManager, type IconAsset } from "@scripts/lib/assets";

interface TestableAssetsManager {
  svgs: IconAsset[];
  errors: string[];
  isScanned: boolean;
  analyzeIconFile(
    path: string,
  ): Promise<{ hash: string; iconName: string } | null>;
}

describe("AssetsManager", () => {
  const readdirMock = readdir as unknown as ReturnType<typeof vi.fn>;
  const testAssetsManager = assetsManager as unknown as TestableAssetsManager;

  beforeEach(() => {
    vi.clearAllMocks();
    readdirMock.mockReset();
    // Reset internal state since assetsManager is a singleton
    testAssetsManager.svgs = [];
    testAssetsManager.errors = [];
    testAssetsManager.isScanned = false;
  });

  it("should scan empty directory successfully", async () => {
    readdirMock.mockResolvedValue([]);

    const result = await assetsManager.scan();

    expect(readdir).toHaveBeenCalledWith("/mocked/path/assets", {
      withFileTypes: true,
    });
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
    expect(testAssetsManager.isScanned).toBe(true);
  });

  it("should report error when non-directory found in assets", async () => {
    readdirMock.mockResolvedValue([
      {
        name: "not-a-directory.svg",
        isDirectory: () => false,
      },
    ]);

    const result = await assetsManager.scan();

    expect(result).toHaveLength(0);
    expect(testAssetsManager.errors).toContain(
      "Family directory expected, but found file: not-a-directory.svg",
    );
  });

  it("should scan family directory and add valid icons", async () => {
    // First call: root directory
    readdirMock.mockResolvedValueOnce([
      {
        name: "solid",
        isDirectory: () => true,
      },
    ]);
    // Second call: family directory
    readdirMock.mockResolvedValueOnce([
      {
        name: "icon.svg",
        isDirectory: () => false,
      },
    ]);

    const analyzeSpy = vi.spyOn(testAssetsManager, "analyzeIconFile");
    analyzeSpy.mockResolvedValue({ hash: "h1", iconName: "Icon" });

    const result = await assetsManager.scan();

    expect(readdirMock).toHaveBeenCalledTimes(2);
    expect(readdirMock).toHaveBeenNthCalledWith(1, "/mocked/path/assets", {
      withFileTypes: true,
    });
    expect(readdirMock).toHaveBeenNthCalledWith(
      2,
      "/mocked/path/assets/solid",
      {
        withFileTypes: true,
      },
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      path: "solid/icon.svg",
      hash: "h1",
      iconName: "Icon",
      family: "solid",
    });
  });

  it("should skip invalid icons when analyzeIconFile fails", async () => {
    readdirMock.mockResolvedValueOnce([
      {
        name: "solid",
        isDirectory: () => true,
      },
    ]);
    readdirMock.mockResolvedValueOnce([
      {
        name: "bad.svg",
        isDirectory: () => false,
      },
    ]);

    const analyzeSpy = vi.spyOn(testAssetsManager, "analyzeIconFile");
    analyzeSpy.mockResolvedValue(null);

    const result = await assetsManager.scan();

    expect(result).toHaveLength(0);
  });
});
