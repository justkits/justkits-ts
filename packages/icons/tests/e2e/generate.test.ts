import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import glob from "fast-glob";

import { builder } from "@scripts/builder";

interface BuilderWithPrivates {
  ASSETS_DIR: string;
  atomicWrite: Mock;
  generate: () => Promise<void>;
}

describe("Icons Builder E2E", () => {
  const builderWithPrivates = builder as unknown as BuilderWithPrivates;
  const assetsDir = builderWithPrivates.ASSETS_DIR;

  let atomicWriteSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock glob to return fake SVG file paths (must be in category folders)
    (glob as unknown as Mock).mockResolvedValue([
      resolve(assetsDir, "media/test-icon.svg"),
      resolve(assetsDir, "media/test-icon2.svg"),
      resolve(assetsDir, "action/arrow-icon.svg"),
    ]);

    // Mock readFile to return unique SVG content for each file to avoid duplicate detection
    (readFile as unknown as Mock).mockImplementation((filePath: string) => {
      const fileName = filePath.split("/").pop() || "";
      // Return unique SVG content based on file name
      if (fileName.includes("test-icon.svg")) {
        return Promise.resolve(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 2L2 12h10v10h10V12h10L12 2z" fill="currentColor"/></svg>',
        );
      } else if (fileName.includes("test-icon2.svg")) {
        return Promise.resolve(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>',
        );
      } else if (fileName.includes("arrow-icon.svg")) {
        return Promise.resolve(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 2L22 12L12 22L2 12z" fill="currentColor"/></svg>',
        );
      } else if (fileName.includes("orphan-icon.svg")) {
        return Promise.resolve(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><rect x="2" y="2" width="20" height="20" fill="currentColor"/></svg>',
        );
      }
      return Promise.resolve(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M0 0h24v24H0z" fill="currentColor"/></svg>',
      );
    });

    // Mock atomicWrite to prevent actual file writes
    atomicWriteSpy = vi.fn().mockResolvedValue(undefined);
    builderWithPrivates.atomicWrite = atomicWriteSpy as unknown as Mock;

    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("should generate icons without errors", async () => {
    await builder.generate();

    // 하나만 테스트 통과하면 나머지는, 제대로 호출됐다고 가정
    expect(atomicWriteSpy).toHaveBeenCalledWith(
      expect.stringContaining("TestIcon"),
      expect.any(String),
    );

    // 호출된 횟수만 추가로 검사
    // svg 3개, family index 2개, 전체 index 1개 = 6회
    // 6 * 2 (web, native 각각 따로 write) = 12회
    expect(atomicWriteSpy).toHaveBeenCalledTimes(12);
  });

  it("should throw error for icons without family folder", async () => {
    // Mock glob to return an icon directly in assets/
    (glob as unknown as Mock).mockResolvedValue([
      resolve(assetsDir, "orphan-icon.svg"),
    ]);

    // Expect the generation to throw an error
    await expect(builder.generate()).rejects.toThrow(
      'Icon "orphan-icon.svg" must be placed inside a category folder',
    );
  });
});
