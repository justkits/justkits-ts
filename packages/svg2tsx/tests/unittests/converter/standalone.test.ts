import { beforeEach, describe, expect, it, vi } from "vitest";

import { StandaloneSvgBuilder } from "@converter/standalone";
import { defaultOptions } from "@converter/options";
import { atomicWrite } from "@lib/atomicWrite";
import { mockBaseDir } from "@tests/setup/mocks";

describe("StandaloneSvgBuilder", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(console, "table").mockImplementation(() => {});
  });

  it("should generate icons with barrel files when generateIndex is true", async () => {
    const builder = new StandaloneSvgBuilder(
      defaultOptions,
      mockBaseDir,
      "Icon",
      true,
    );
    await builder.generate();

    // Verify component files were written
    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringContaining("components/TestIcon.tsx"),
      expect.any(String),
    );
    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringContaining("components/SecondTestIcon.tsx"),
      expect.any(String),
    );
    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringContaining("components/ArrowIcon.tsx"),
      expect.any(String),
    );

    // Verify root barrel file was written
    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringContaining("src/index.ts"),
      expect.stringContaining(
        'export { TestIcon } from "./components/TestIcon";',
      ),
    );
    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringContaining("src/index.ts"),
      expect.stringContaining(
        'export { SecondTestIcon } from "./components/SecondTestIcon";',
      ),
    );
    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringContaining("src/index.ts"),
      expect.stringContaining(
        'export { ArrowIcon } from "./components/ArrowIcon";',
      ),
    );
  });

  it("should not generate barrel files when generateIndex is false", async () => {
    const builder = new StandaloneSvgBuilder(
      defaultOptions,
      mockBaseDir,
      "Icon",
      false,
    );
    await builder.generate();

    // Verify component files were written
    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringContaining("components/TestIcon.tsx"),
      expect.any(String),
    );
    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringContaining("components/SecondTestIcon.tsx"),
      expect.any(String),
    );
    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringContaining("components/ArrowIcon.tsx"),
      expect.any(String),
    );

    // Verify barrel files were NOT written
    expect(atomicWrite).not.toHaveBeenCalledWith(
      expect.stringContaining("index.ts"),
      expect.any(String),
    );
  });
});
