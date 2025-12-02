import { SVGDatabaseManager } from "@justkits/svgs-core";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { databaseManager, IconMetadata } from "@scripts/lib/database";

interface TestableDatabaseManager {
  iconsTable: Map<string, IconMetadata>;
  isLoaded: boolean;
  FILE_PATH: string;
}

describe("DatabaseManager", () => {
  const testManager = databaseManager as unknown as TestableDatabaseManager;

  beforeEach(() => {
    vi.restoreAllMocks();
    // Reset internal state of the singleton instance if needed
    // Accessing protected/private members via type casting for testing purposes
    testManager.iconsTable = new Map();
    testManager.isLoaded = false;
  });

  it("should be an instance of SVGDatabaseManager", () => {
    expect(databaseManager).toBeInstanceOf(SVGDatabaseManager);
  });

  it("should be initialized with the correct database path", () => {
    expect(testManager.FILE_PATH).toBe("/mocked/path/database.json");
  });

  it("should call underlying load method", async () => {
    const loadSpy = vi.spyOn(databaseManager, "load");
    await databaseManager.load();
    expect(loadSpy).toHaveBeenCalledTimes(1);
    expect(testManager.isLoaded).toBe(true);
  });

  it("should call underlying save method", async () => {
    const saveSpy = vi.spyOn(databaseManager, "save");
    await databaseManager.save();
    expect(saveSpy).toHaveBeenCalledTimes(1);
  });

  it("should upsert and retrieve data correctly", () => {
    const mockData: IconMetadata = {
      family: "app",
      hash: "h1",
      iconName: "Settings",
      componentName: "Settings",
      path: "app/settings.svg",
    };

    const upsertSpy = vi.spyOn(databaseManager, "upsert");
    databaseManager.upsert(mockData);

    expect(upsertSpy).toHaveBeenCalledWith(mockData);
    expect(databaseManager.get("Settings")).toEqual(mockData);
    expect(databaseManager.getAll()).toContainEqual(mockData);
  });

  it("should delete data correctly", () => {
    const mockData: IconMetadata = {
      family: "app",
      hash: "h1",
      iconName: "Settings",
      componentName: "Settings",
      path: "app/settings.svg",
    };

    databaseManager.upsert(mockData);
    expect(databaseManager.get("Settings")).toBeDefined();

    const deleteSpy = vi.spyOn(databaseManager, "delete");
    databaseManager.delete("Settings");

    expect(deleteSpy).toHaveBeenCalledWith("Settings");
    expect(databaseManager.get("Settings")).toBeNull();
  });
});
