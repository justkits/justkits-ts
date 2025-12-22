import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { resolve } from "node:path";
import glob from "fast-glob";

import { mockAssetsDir, mockBaseDir } from "../setup/mocks";
import { FamilySvgBuilder } from "@/builder/family";
import { defaultOptions } from "@/builder/options";

describe("FamilySvgBuilder", () => {
  let builder: FamilySvgBuilder;
  let atomicWriteSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    builder = new FamilySvgBuilder(defaultOptions, mockBaseDir);

    // Mock atomicWrite to prevent actual file writes
    atomicWriteSpy = vi.fn().mockResolvedValue(undefined);
    (builder as any).atomicWrite = atomicWriteSpy; // eslint-disable-line @typescript-eslint/no-explicit-any

    vi.spyOn(console, "table").mockImplementation(() => {});
  });

  it("should generate icons without errors", async () => {
    await builder.generate();

    // Verify component files were written
    expect(atomicWriteSpy).toHaveBeenCalledWith(
      expect.stringContaining("media/components/TestIcon.tsx"),
      expect.any(String),
    );
    expect(atomicWriteSpy).toHaveBeenCalledWith(
      expect.stringContaining("media/components/SecondTestIcon.tsx"),
      expect.any(String),
    );
    expect(atomicWriteSpy).toHaveBeenCalledWith(
      expect.stringContaining("action/components/ArrowIcon.tsx"),
      expect.any(String),
    );

    // Verify family barrel files were written
    expect(atomicWriteSpy).toHaveBeenCalledWith(
      expect.stringContaining("media/index.ts"),
      expect.stringContaining(
        'export { TestIcon } from "./components/TestIcon";',
      ),
    );
    expect(atomicWriteSpy).toHaveBeenCalledWith(
      expect.stringContaining("action/index.ts"),
      expect.stringContaining(
        'export { ArrowIcon } from "./components/ArrowIcon";',
      ),
    );

    // Verify root barrel file was written
    expect(atomicWriteSpy).toHaveBeenCalledWith(
      expect.stringContaining("src/index.ts"),
      expect.stringContaining(
        'export { SecondTestIcon, TestIcon } from "./media";',
      ),
    );
    expect(atomicWriteSpy).toHaveBeenCalledWith(
      expect.stringContaining("src/index.ts"),
      expect.stringContaining('export { ArrowIcon } from "./action";'),
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
