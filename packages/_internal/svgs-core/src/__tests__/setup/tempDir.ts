import { existsSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach } from "vitest";

/**
 * Creates a temporary directory for tests with automatic setup/teardown.
 *
 * @param name - Unique name for the temp directory (e.g., "db-test", "assets-test")
 * @returns The path to the temporary directory
 *
 * @example
 * ```ts
 * describe("MyTest", () => {
 *   const testDir = useTempDir("my-test");
 *
 *   it("should work", () => {
 *     // testDir is created before each test and cleaned up after
 *   });
 * });
 * ```
 */
export function useTempDir(name: string): string {
  const testDir = join(tmpdir(), `svgs-core-${name}`);

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  return testDir;
}
