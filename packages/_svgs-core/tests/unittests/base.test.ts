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
  });

  it("should throw error for invalid filenames", async () => {
    (glob as unknown as Mock).mockResolvedValue([
      resolve(mockAssetsDir, "media/Invalid_Name.svg"),
    ]);

    await expect(builder.generate()).rejects.toThrow(
      'Invalid filename: "Invalid_Name"',
    );
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

  it("test atomicWrite", async () => {
    // Mock rename to fail
    (rename as unknown as Mock).mockRejectedValueOnce(
      new Error("Rename failed"),
    );

    const testPath = "/test/path/file.tsx";
    const testContent = "test content";

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
  });
});
