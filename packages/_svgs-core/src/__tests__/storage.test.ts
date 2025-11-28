import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

import { useTempDir } from "./setup/tempDir";
import { atomicWrite } from "@lib/storage";

vi.unmock("@lib/storage");

describe("atomicWrite", () => {
  const testDir = useTempDir("storage-test");

  it("should create a file with the given content", async () => {
    const filePath = join(testDir, "test.txt");
    const content = "Hello, World!";

    await atomicWrite(filePath, content);

    expect(existsSync(filePath)).toBe(true);
    expect(readFileSync(filePath, "utf-8")).toBe(content);
  });

  it("should create parent directories if they do not exist", async () => {
    const filePath = join(testDir, "nested", "deep", "test.txt");
    const content = "Nested content";

    await atomicWrite(filePath, content);

    expect(existsSync(filePath)).toBe(true);
    expect(readFileSync(filePath, "utf-8")).toBe(content);
  });

  it("should overwrite existing file content", async () => {
    const filePath = join(testDir, "overwrite.txt");

    await atomicWrite(filePath, "First content");
    await atomicWrite(filePath, "Second content");

    expect(readFileSync(filePath, "utf-8")).toBe("Second content");
  });

  it("should not leave temp files on success", async () => {
    const filePath = join(testDir, "no-temp.txt");

    await atomicWrite(filePath, "content");

    const tempFilePath = `${filePath}.tmp`;
    expect(existsSync(tempFilePath)).toBe(false);
  });
});
