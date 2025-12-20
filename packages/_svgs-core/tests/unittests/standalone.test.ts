import { describe, expect, it, vi } from "vitest";

import { mockBaseDir } from "../setup/mocks";
import { StandaloneSvgBuilder } from "@/builder/standalone";
import { defaultOptions } from "@/builder/options";

describe("StandaloneSvgBuilder", () => {
  it("should generate icons without errors", async () => {
    vi.spyOn(console, "table").mockImplementation(() => {});

    const builder = new StandaloneSvgBuilder(defaultOptions, mockBaseDir);
    const atomicWriteSpy = vi.fn().mockResolvedValue(undefined);
    (builder as any).atomicWrite = atomicWriteSpy; // eslint-disable-line @typescript-eslint/no-explicit-any
    await builder.generate();

    // Verify component files were written
    expect(atomicWriteSpy).toHaveBeenCalledWith(
      expect.stringContaining("components/TestIcon.tsx"),
      expect.any(String),
    );
    expect(atomicWriteSpy).toHaveBeenCalledWith(
      expect.stringContaining("components/TestIcon2.tsx"),
      expect.any(String),
    );
    expect(atomicWriteSpy).toHaveBeenCalledWith(
      expect.stringContaining("components/ArrowIcon.tsx"),
      expect.any(String),
    );

    // Verify root barrel file was written
    expect(atomicWriteSpy).toHaveBeenCalledWith(
      expect.stringContaining("src/index.ts"),
      expect.stringContaining(
        'export { TestIcon } from "./components/TestIcon";',
      ),
    );
    expect(atomicWriteSpy).toHaveBeenCalledWith(
      expect.stringContaining("src/index.ts"),
      expect.stringContaining(
        'export { TestIcon2 } from "./components/TestIcon2";',
      ),
    );
    expect(atomicWriteSpy).toHaveBeenCalledWith(
      expect.stringContaining("src/index.ts"),
      expect.stringContaining(
        'export { ArrowIcon } from "./components/ArrowIcon";',
      ),
    );
  });
});
