import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import glob from "fast-glob";

import { FamilySvgBuilder } from "@converter/family";
import { defaultOptions } from "@converter/options";
import { atomicWrite } from "@lib/atomicWrite";
import { mockAssetsDir, mockBaseDir } from "@tests/setup/mocks";

// 공통된 코드를 작성하기 때문에,
// FamilySvgBuilder, StandaloneSvgBuilder 중 아무거나 사용해도 무방하다.

describe("BaseSvgBuilder", () => {
  let builder: FamilySvgBuilder;

  beforeEach(async () => {
    vi.clearAllMocks();
    builder = new FamilySvgBuilder(defaultOptions, mockBaseDir);
    vi.spyOn(console, "table").mockImplementation(() => {});
  });

  it("should generate components successfully", async () => {
    await builder.generate();

    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringContaining("media/components/Test.tsx"),
      expect.any(String),
    );
    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringContaining("media/components/SecondTest.tsx"),
      expect.any(String),
    );
    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringContaining("action/components/Arrow.tsx"),
      expect.any(String),
    );
  });

  it("should generate components successfully with index and suffix", async () => {
    builder = new FamilySvgBuilder(defaultOptions, mockBaseDir, "Icon", true);
    vi.spyOn(console, "table").mockImplementation(() => {});

    await builder.generate();

    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringContaining("media/index.ts"),
      expect.stringContaining(
        'export { TestIcon } from "./components/TestIcon";',
      ),
    );
    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringContaining("action/index.ts"),
      expect.stringContaining(
        'export { ArrowIcon } from "./components/ArrowIcon";',
      ),
    );

    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringContaining("src/index.ts"),
      expect.stringContaining(
        'export { SecondTestIcon, TestIcon } from "./media";',
      ),
    );
  });

  it("should fail invalid kebab-case filename", async () => {
    // 편의상 여기서는 하나만 테스트
    (glob as unknown as Mock).mockResolvedValue([
      resolve(mockAssetsDir, "media/Invalid_Name.svg"),
    ]);
    await expect(builder.generate()).rejects.toThrow(
      'Invalid filename: "Invalid_Name". Filenames must be strictly kebab-case (lowercase letters and single dashes only, e.g., "my-icon").',
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
});
