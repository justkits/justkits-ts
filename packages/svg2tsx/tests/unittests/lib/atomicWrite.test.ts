import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { writeFile, rename, rm, mkdir } from "node:fs/promises";

import { atomicWrite } from "@lib/atomicWrite";

vi.mock("node:fs/promises", async () => {
  return {
    mkdir: vi.fn().mockResolvedValue(undefined),
    rename: vi.fn().mockResolvedValue(undefined),
    rm: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
  };
});
vi.unmock("@lib/atomicWrite");

describe("atomicWrite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should write content to a temporary file and then rename it", async () => {
    const filePath = "test.txt";
    const content = "hello world";

    await atomicWrite(filePath, content);

    // Verify directory creation
    expect(mkdir).toHaveBeenCalledWith(".", { recursive: true });

    // Verify temporary file write
    expect(writeFile).toHaveBeenCalledWith(`${filePath}.tmp`, content, "utf-8");

    // Verify rename to final path
    expect(rename).toHaveBeenCalledWith(`${filePath}.tmp`, filePath);
  });

  it("should delete temporary file and throw error if rename fails", async () => {
    const filePath = "error.txt";
    const content = "fail";
    const error = new Error("rename failed");

    // Mock rename to fail
    (rename as unknown as Mock).mockRejectedValueOnce(error);

    // Should throw the same error
    await expect(atomicWrite(filePath, content)).rejects.toThrow(error);

    // Should cleanup the temporary file
    expect(rm).toHaveBeenCalledWith(`${filePath}.tmp`, { force: true });
  });

  it("should handle nested directories", async () => {
    const filePath = "path/to/nested/file.txt";
    const content = "nested content";

    await atomicWrite(filePath, content);

    expect(mkdir).toHaveBeenCalledWith("path/to/nested", { recursive: true });
    expect(writeFile).toHaveBeenCalledWith(`${filePath}.tmp`, content, "utf-8");
    expect(rename).toHaveBeenCalledWith(`${filePath}.tmp`, filePath);
  });
});
