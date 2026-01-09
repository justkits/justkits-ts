import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { resolve } from "node:path";
import glob from "fast-glob";

import { FamilySvgBuilder } from "@converter/family";
import { defaultOptions } from "@converter/options";
import { atomicWrite } from "@lib/atomicWrite";
import { mockAssetsDir, mockBaseDir } from "@tests/setup/mocks";

describe("FamilySvgBuilder", () => {
  let builder: FamilySvgBuilder;

  beforeEach(async () => {
    vi.clearAllMocks();
    builder = new FamilySvgBuilder(defaultOptions, mockBaseDir, "Icon", true);

    vi.spyOn(console, "table").mockImplementation(() => {});
  });

  it("should generate icons with barrel files when generateIndex is true", async () => {
    await builder.generate();

    // Verify component files were written
    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringContaining("media/components/TestIcon.tsx"),
      expect.any(String),
    );
    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringContaining("media/components/SecondTestIcon.tsx"),
      expect.any(String),
    );
    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringContaining("action/components/ArrowIcon.tsx"),
      expect.any(String),
    );

    // Verify family barrel files were written
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

    // Verify root barrel file was written
    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringContaining("src/index.ts"),
      expect.stringContaining(
        'export { SecondTestIcon, TestIcon } from "./media";',
      ),
    );
    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringContaining("src/index.ts"),
      expect.stringContaining('export { ArrowIcon } from "./action";'),
    );
  });

  it("should not generate barrel files when generateIndex is false", async () => {
    const builderWithoutIndex = new FamilySvgBuilder(
      defaultOptions,
      mockBaseDir,
      "",
      false,
    );

    await builderWithoutIndex.generate();

    // Verify component files were written
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

    // Verify barrel files were NOT written
    expect(atomicWrite).not.toHaveBeenCalledWith(
      expect.stringContaining("index.ts"),
      expect.any(String),
    );
  });

  it("should throw error for icons without family folder", async () => {
    (glob as unknown as Mock).mockResolvedValue([
      resolve(mockAssetsDir, "orphan-icon.svg"),
    ]);

    await expect(builder.generate()).rejects.toThrow(
      'Icon "orphan-icon.svg" must be placed inside a category folder',
    );
  });
});
