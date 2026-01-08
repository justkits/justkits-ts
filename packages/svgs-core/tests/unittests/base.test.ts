import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { readFile, rename, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import glob from "fast-glob";

import { mockAssetsDir, mockBaseDir } from "../setup/mocks";
import { FamilySvgBuilder } from "@/builder/family";
import { defaultOptions } from "@/builder/options";

// 공통된 코드를 작성하기 때문에,
// FamilySvgBuilder, StandaloneSvgBuilder 중 아무거나 사용해도 무방하다.

describe("BaseSvgBuilder", () => {
  let builder: FamilySvgBuilder;

  beforeEach(async () => {
    vi.clearAllMocks();
    builder = new FamilySvgBuilder(defaultOptions, mockBaseDir);
    vi.spyOn(console, "table").mockImplementation(() => {});
  });

  describe("Kebab-case validation", () => {
    it("should accept valid kebab-case filenames", async () => {
      (glob as unknown as Mock).mockResolvedValue([
        resolve(mockAssetsDir, "media/my-icon.svg"),
        resolve(mockAssetsDir, "media/icon.svg"),
        resolve(mockAssetsDir, "media/user-profile.svg"),
      ]);
      (readFile as unknown as Mock).mockImplementation((filePath: string) => {
        const uniqueContent = `<svg>${filePath}</svg>`;
        return Promise.resolve(uniqueContent);
      });

      await expect(builder.generate()).resolves.not.toThrow();
    });

    it("should reject filename with uppercase letters", async () => {
      (glob as unknown as Mock).mockResolvedValue([
        resolve(mockAssetsDir, "media/MyIcon.svg"),
      ]);

      await expect(builder.generate()).rejects.toThrow(
        'Invalid filename: "MyIcon"',
      );
    });

    it("should reject filename with underscores", async () => {
      (glob as unknown as Mock).mockResolvedValue([
        resolve(mockAssetsDir, "media/icon_name.svg"),
      ]);

      await expect(builder.generate()).rejects.toThrow(
        'Invalid filename: "icon_name"',
      );
    });

    it("should reject filename starting with number", async () => {
      (glob as unknown as Mock).mockResolvedValue([
        resolve(mockAssetsDir, "media/123-icon.svg"),
      ]);

      await expect(builder.generate()).rejects.toThrow(
        'Invalid filename: "123-icon"',
      );
    });

    it("should reject filename containing numbers", async () => {
      (glob as unknown as Mock).mockResolvedValue([
        resolve(mockAssetsDir, "media/icon2.svg"),
      ]);

      await expect(builder.generate()).rejects.toThrow(
        'Invalid filename: "icon2"',
      );
    });

    it("should reject filename with numbers in middle", async () => {
      (glob as unknown as Mock).mockResolvedValue([
        resolve(mockAssetsDir, "media/my-icon-2.svg"),
      ]);

      await expect(builder.generate()).rejects.toThrow(
        'Invalid filename: "my-icon-2"',
      );
    });

    it("should reject filename starting with dash", async () => {
      (glob as unknown as Mock).mockResolvedValue([
        resolve(mockAssetsDir, "media/-icon.svg"),
      ]);

      await expect(builder.generate()).rejects.toThrow(
        'Invalid filename: "-icon"',
      );
    });

    it("should reject filename ending with dash", async () => {
      (glob as unknown as Mock).mockResolvedValue([
        resolve(mockAssetsDir, "media/icon-.svg"),
      ]);

      await expect(builder.generate()).rejects.toThrow(
        'Invalid filename: "icon-"',
      );
    });

    it("should reject filename with double dashes", async () => {
      (glob as unknown as Mock).mockResolvedValue([
        resolve(mockAssetsDir, "media/icon--name.svg"),
      ]);

      await expect(builder.generate()).rejects.toThrow(
        'Invalid filename: "icon--name"',
      );
    });
  });

  it("should throw error for duplicate component names", async () => {
    (glob as unknown as Mock).mockResolvedValue([
      resolve(mockAssetsDir, "media/icon-one.svg"),
      resolve(mockAssetsDir, "action/icon-one.svg"),
    ]);
    (readFile as unknown as Mock).mockImplementation((filePath: string) => {
      return filePath.includes("media")
        ? Promise.resolve("<svg>content1</svg>")
        : Promise.resolve("<svg>content2</svg>");
    });

    await expect(builder.generate()).rejects.toThrow(
      "Duplicate component names found",
    );
  });

  it("should throw error for duplicate SVG content", async () => {
    (glob as unknown as Mock).mockResolvedValue([
      resolve(mockAssetsDir, "media/icon-one.svg"),
      resolve(mockAssetsDir, "media/icon-two.svg"),
    ]);
    (readFile as unknown as Mock).mockResolvedValue(
      Promise.resolve("<svg>same content</svg>"),
    );

    await expect(builder.generate()).rejects.toThrow(
      "Duplicate SVG content found",
    );
  });

  it("should test atomicWrite success path", async () => {
    const testPath = "/test/path/file.tsx";
    const testContent = "test content";

    // Call atomicWrite - should succeed with mocked functions
    await expect(
      (builder as any).atomicWrite(testPath, testContent), // eslint-disable-line @typescript-eslint/no-explicit-any
    ).resolves.not.toThrow();

    // Verify writeFile was called with temp file
    expect(writeFile).toHaveBeenCalledWith(
      `${testPath}.tmp`,
      testContent,
      "utf-8",
    );

    // Verify rename was called
    expect(rename).toHaveBeenCalledWith(`${testPath}.tmp`, testPath);
  });

  it("should test atomicWrite error handling", async () => {
    const testPath = "/test/path/file-error.tsx";
    const testContent = "test content";

    // Mock rename to fail for this specific test
    const originalRename = rename;
    (rename as unknown as Mock).mockRejectedValueOnce(
      new Error("Rename failed"),
    );

    // Call atomicWrite and expect it to throw
    await expect(
      (builder as any).atomicWrite(testPath, testContent), // eslint-disable-line @typescript-eslint/no-explicit-any
    ).rejects.toThrow("Rename failed");

    // Verify writeFile was called with temp file
    expect(writeFile).toHaveBeenCalledWith(
      `${testPath}.tmp`,
      testContent,
      "utf-8",
    );

    // Verify temp file cleanup was attempted
    expect(rm).toHaveBeenCalledWith(`${testPath}.tmp`, { force: true });

    // Verify rename was attempted
    expect(rename).toHaveBeenCalledWith(`${testPath}.tmp`, testPath);

    // Restore original mock
    (rename as unknown as Mock).mockImplementation(originalRename);
  });
});
