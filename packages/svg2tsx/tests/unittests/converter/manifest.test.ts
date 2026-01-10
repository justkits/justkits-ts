import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";

import { FamilySvgBuilder } from "@converter/family";
import { defaultOptions } from "@converter/options";
import { atomicWrite } from "@lib/atomicWrite";
import { mockBaseDir } from "@tests/setup/mocks";

describe("Manifest Generation and Cleanup", () => {
  let builder: FamilySvgBuilder;
  const manifestPath = resolve(mockBaseDir, "src/.svg2tsx-manifest.json");

  beforeEach(async () => {
    vi.clearAllMocks();
    builder = new FamilySvgBuilder(defaultOptions, mockBaseDir);
    vi.spyOn(console, "table").mockImplementation(() => {});
  });

  it("should generate manifest file with list of generated files", async () => {
    await builder.generate();

    // Verify atomicWrite is called with the correct manifest filename
    expect(atomicWrite).toHaveBeenCalledWith(
      expect.stringMatching(/\.svg2tsx-manifest\.json$/),
      expect.any(String),
    );

    expect(atomicWrite).toHaveBeenCalledWith(
      manifestPath,
      expect.stringContaining("media/components/Test.tsx"),
    );

    // Check if the content passed to atomicWrite is a valid JSON array
    const lastCall = (atomicWrite as Mock).mock.calls.find(
      (call) => call[0] === manifestPath,
    );
    expect(lastCall).toBeDefined();
    const content = JSON.parse(lastCall![1]);
    expect(Array.isArray(content)).toBe(true);
    expect(content).toContain(
      resolve(mockBaseDir, "src/media/components/Test.tsx"),
    );
  });

  it("should clean up files based on manifest", async () => {
    // Mock existing manifest
    const oldFile = resolve(mockBaseDir, "src/old-file.tsx");
    const manifestContent = JSON.stringify([oldFile]);

    (readFile as unknown as Mock).mockImplementation((path: string) => {
      if (path === manifestPath) {
        return Promise.resolve(manifestContent);
      }
      // Return unique content for each file to avoid duplicate content check
      return Promise.resolve(`<svg id="${path}"></svg>`);
    });

    await builder.generate();

    expect(rm).toHaveBeenCalledWith(oldFile, { force: true });
  });

  it("should not delete files outside SRC_DIR even if in manifest", async () => {
    // Mock malicious manifest
    const unsafeFile = resolve(mockBaseDir, "outside.tsx");
    const manifestContent = JSON.stringify([unsafeFile]);

    (readFile as unknown as Mock).mockImplementation((path: string) => {
      if (path === manifestPath) {
        return Promise.resolve(manifestContent);
      }
      return Promise.resolve(`<svg id="${path}"></svg>`);
    });

    await builder.generate();

    expect(rm).not.toHaveBeenCalledWith(unsafeFile, expect.anything());
  });
});
