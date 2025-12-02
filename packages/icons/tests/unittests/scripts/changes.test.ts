import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";

import { changesDetector } from "@scripts/core/changes";
import { databaseManager, IconMetadata } from "@scripts/lib/database";

// Define testable interface
interface TestableChangesDetector {
  iconNames: Record<string, string>;
  iconHashes: Record<string, string>;
  toConvert: IconMetadata[];
  toDelete: IconMetadata[];
  addedCount: number;
  updatedCount: number;
  errors: string[];
}

// Mock databaseManager methods
vi.mock("@scripts/lib/database", () => ({
  databaseManager: {
    get: vi.fn(),
    getAll: vi.fn(),
  },
}));

describe("ChangesDetector", () => {
  const mockDatabaseManager = databaseManager as Mocked<typeof databaseManager>;
  const testDetector = changesDetector as unknown as TestableChangesDetector;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();

    // Mock console methods
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});

    // Reset internal state of changesDetector for each test
    testDetector.iconNames = {};
    testDetector.iconHashes = {};
    testDetector.toConvert = [];
    testDetector.toDelete = [];
    testDetector.addedCount = 0;
    testDetector.updatedCount = 0;
    testDetector.errors = [];

    // Default mock for databaseManager.get to return null (no existing icon)
    mockDatabaseManager.get.mockReturnValue(null);
    // Default mock for databaseManager.getAll to return empty array
    mockDatabaseManager.getAll.mockReturnValue([]);
  });

  it("should be an instance of ChangesDetector", () => {
    expect(changesDetector).toBeInstanceOf(changesDetector.constructor);
  });

  it("should detect no changes when database and assets match", () => {
    const asset = {
      family: "app",
      path: "app/settings.svg",
      hash: "hash1",
      iconName: "settings",
    };
    const dbIcon = {
      family: "app",
      path: "app/settings.svg",
      hash: "hash1",
      iconName: "settings",
      componentName: "Settings",
    };

    mockDatabaseManager.get.mockReturnValue(dbIcon);
    mockDatabaseManager.getAll.mockReturnValue([dbIcon]);

    const result = changesDetector.run([asset]);

    expect(result.toConvert).toHaveLength(0);
    expect(result.toDelete).toHaveLength(0);
    expect(testDetector.addedCount).toBe(0);
    expect(testDetector.updatedCount).toBe(0);

    // Expect success message
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("✅ No validation errors found."),
    );
  });

  it("should detect a new icon", () => {
    const newAsset = {
      family: "app",
      path: "app/new-icon.svg",
      hash: "hashNew",
      iconName: "new-icon",
    };

    mockDatabaseManager.get.mockReturnValue(null); // Simulate new icon

    const result = changesDetector.run([newAsset]);

    expect(result.toConvert).toHaveLength(1);
    expect(result.toConvert[0]).toEqual({
      ...newAsset,
      componentName: "NewIcon",
    });
    expect(result.toDelete).toHaveLength(0);
    expect(testDetector.addedCount).toBe(1);
    expect(testDetector.updatedCount).toBe(0);
  });

  it("should detect an updated icon", () => {
    const oldDbIcon = {
      family: "app",
      path: "app/settings.svg",
      hash: "hashOld",
      iconName: "settings",
      componentName: "Settings",
    };
    const updatedAsset = {
      family: "app",
      path: "app/settings.svg",
      hash: "hashUpdated",
      iconName: "settings",
    };

    mockDatabaseManager.get.mockReturnValue(oldDbIcon); // Icon exists but with old hash

    const result = changesDetector.run([updatedAsset]);

    expect(result.toConvert).toHaveLength(1);
    expect(result.toConvert[0]).toEqual({
      ...updatedAsset,
      componentName: "Settings",
    });
    expect(result.toDelete).toHaveLength(0);
    expect(testDetector.addedCount).toBe(0);
    expect(testDetector.updatedCount).toBe(1);
  });

  it("should detect a deleted icon", () => {
    const existingDbIcon = {
      family: "app",
      path: "app/old-icon.svg",
      hash: "hashOld",
      iconName: "old-icon",
      componentName: "OldIcon",
    };

    mockDatabaseManager.getAll.mockReturnValue([existingDbIcon]);
    // No assets passed to run, so existingDbIcon should be deleted

    const result = changesDetector.run([]);

    expect(result.toConvert).toHaveLength(0);
    expect(result.toDelete).toHaveLength(1);
    expect(result.toDelete[0]).toEqual(existingDbIcon);
  });

  it("should throw error for duplicate icon names in assets", () => {
    const asset1 = {
      family: "app",
      path: "app/icon1.svg",
      hash: "hash1",
      iconName: "duplicate-icon",
    };
    const asset2 = {
      family: "app",
      path: "app/icon2.svg",
      hash: "hash2",
      iconName: "duplicate-icon",
    };

    expect(() => changesDetector.run([asset1, asset2])).toThrow(
      "Validation errors detected during changes detection.",
    );
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(
        '[Validation Error] Duplicate name "duplicate-icon"',
      ),
    );
  });

  it("should throw error for duplicate icon hashes in assets", () => {
    const asset1 = {
      family: "app",
      path: "app/icon1.svg",
      hash: "duplicate-hash",
      iconName: "icon1",
    };
    const asset2 = {
      family: "app",
      path: "app/icon2.svg",
      hash: "duplicate-hash",
      iconName: "icon2",
    };

    expect(() => changesDetector.run([asset1, asset2])).toThrow(
      "Validation errors detected during changes detection.",
    );
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("[Validation Error] Duplicate content:"),
    );
  });
});
