import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TestSVGMetadata } from "./setup/managers";
import { useTempDir } from "./setup/tempDir";
import { SVGDatabaseManager } from "@managers/database";

describe("SVGDatabaseManager", () => {
  const testDir = useTempDir("db-test");
  const dbPath = join(testDir, "icons.json");
  let db: SVGDatabaseManager<TestSVGMetadata>;

  const sampleIcon: TestSVGMetadata = {
    path: "app/icon.svg",
    hash: "abc123",
    componentName: "Icon",
    iconName: "icon",
  };

  const anotherIcon: TestSVGMetadata = {
    path: "app/another.svg",
    hash: "def456",
    componentName: "Another",
    iconName: "another",
  };

  beforeEach(() => {
    db = new SVGDatabaseManager<TestSVGMetadata>(dbPath);
  });

  describe("load", () => {
    it("should start fresh when db file does not exist", async () => {
      await db.load();

      expect(db.getAll()).toEqual([]);
    });

    it("should load existing data from file", async () => {
      const existingData: [string, TestSVGMetadata][] = [
        ["icon", sampleIcon],
        ["another", anotherIcon],
      ];
      writeFileSync(dbPath, JSON.stringify(existingData));

      await db.load();

      expect(db.getAll()).toHaveLength(2);
      expect(db.get("icon")).toEqual(sampleIcon);
      expect(db.get("another")).toEqual(anotherIcon);
    });

    it("should throw on corrupted JSON file", async () => {
      writeFileSync(dbPath, "{ invalid json }");

      await expect(db.load()).rejects.toThrow();
    });

    it("should throw and handle non-Error exceptions during load", async () => {
      writeFileSync(dbPath, "valid content");

      const fs = await import("node:fs/promises");
      vi.mocked(fs.readFile).mockRejectedValueOnce("string error");

      await expect(db.load()).rejects.toBe("string error");
    });
  });

  describe("save", () => {
    it("should throw if not loaded", async () => {
      await expect(db.save()).rejects.toThrow(
        "Database not loaded. Call load() before performing operations.",
      );
    });

    it("should skip save when no changes", async () => {
      await db.load();
      await db.save();

      expect(existsSync(dbPath)).toBe(false);
    });

    it("should save changes to file", async () => {
      await db.load();
      db.upsert(sampleIcon);
      await db.save();

      expect(existsSync(dbPath)).toBe(true);
      const saved = JSON.parse(readFileSync(dbPath, "utf-8"));
      expect(saved).toEqual([["icon", sampleIcon]]);
    });

    it("should reset saveNeeded flag after save", async () => {
      await db.load();
      db.upsert(sampleIcon);
      await db.save();

      // Second save should be skipped (no changes)
      await db.save();
      // If it didn't throw and file still exists, saveNeeded was reset
      expect(existsSync(dbPath)).toBe(true);
    });

    it("should throw and log when atomicWrite fails with Error", async () => {
      const { atomicWrite } = await import("@lib/storage");
      vi.mocked(atomicWrite).mockRejectedValueOnce(new Error("Write failed"));

      await db.load();
      db.upsert(sampleIcon);

      await expect(db.save()).rejects.toThrow("Write failed");
    });

    it("should throw and handle non-Error exceptions", async () => {
      const { atomicWrite } = await import("@lib/storage");
      vi.mocked(atomicWrite).mockRejectedValueOnce("string error");

      await db.load();
      db.upsert(sampleIcon);

      await expect(db.save()).rejects.toBe("string error");
    });
  });

  describe("get", () => {
    it("should throw if not loaded", () => {
      expect(() => db.get("icon")).toThrow(
        "Database not loaded. Call load() before performing operations.",
      );
    });

    it("should return null for non-existing icon", async () => {
      await db.load();

      expect(db.get("nonexistent")).toBeNull();
    });

    it("should return icon metadata", async () => {
      await db.load();
      db.upsert(sampleIcon);

      expect(db.get("icon")).toEqual(sampleIcon);
    });
  });

  describe("getAll", () => {
    it("should throw if not loaded", () => {
      expect(() => db.getAll()).toThrow(
        "Database not loaded. Call load() before performing operations.",
      );
    });

    it("should return empty array when no icons", async () => {
      await db.load();

      expect(db.getAll()).toEqual([]);
    });

    it("should return all icons", async () => {
      await db.load();
      db.upsert(sampleIcon);
      db.upsert(anotherIcon);

      const all = db.getAll();
      expect(all).toHaveLength(2);
      expect(all).toContainEqual(sampleIcon);
      expect(all).toContainEqual(anotherIcon);
    });
  });

  describe("upsert", () => {
    it("should throw if not loaded", () => {
      expect(() => db.upsert(sampleIcon)).toThrow(
        "Database not loaded. Call load() before performing operations.",
      );
    });

    it("should add new icon", async () => {
      await db.load();
      db.upsert(sampleIcon);

      expect(db.get("icon")).toEqual(sampleIcon);
    });

    it("should update existing icon with new hash", async () => {
      await db.load();
      db.upsert(sampleIcon);

      const updatedIcon: TestSVGMetadata = {
        ...sampleIcon,
        hash: "newhash789",
      };
      db.upsert(updatedIcon);

      expect(db.get("icon")).toEqual(updatedIcon);
    });

    it("should handle upsert with same hash (no-op update)", async () => {
      await db.load();
      db.upsert(sampleIcon);
      db.upsert(sampleIcon); // Same hash

      expect(db.get("icon")).toEqual(sampleIcon);
    });
  });

  describe("delete", () => {
    it("should throw if not loaded", () => {
      expect(() => db.delete("icon")).toThrow(
        "Database not loaded. Call load() before performing operations.",
      );
    });

    it("should delete existing icon", async () => {
      await db.load();
      db.upsert(sampleIcon);
      db.delete("icon");

      expect(db.get("icon")).toBeNull();
    });

    it("should be no-op for non-existing icon", async () => {
      await db.load();
      db.delete("nonexistent");

      expect(db.getAll()).toEqual([]);
    });
  });
});
