import { vi } from "vitest";
import { resolve } from "node:path";

export const mockBaseDir = "/mock/base/dir";
export const mockAssetsDir = resolve(mockBaseDir, "assets");

vi.mock("node:fs/promises", async (importOriginal) => {
  const original = await importOriginal<typeof import("node:fs/promises")>();
  return {
    ...original,
    readFile: vi.fn().mockImplementation((filePath: string) => {
      const fileName = filePath.split("/").pop() || "";
      if (fileName === "test-icon.svg") {
        return Promise.resolve(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 2L2 12h10v10h10V12h10L12 2z" fill="currentColor"/></svg>',
        );
      } else if (fileName === "second-test-icon.svg") {
        return Promise.resolve(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>',
        );
      } else if (fileName === "arrow-icon.svg") {
        return Promise.resolve(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 2L22 12L12 22L2 12z" fill="currentColor"/></svg>',
        );
      } else if (fileName === "orphan-icon.svg") {
        return Promise.resolve(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><rect x="2" y="2" width="20" height="20" fill="currentColor"/></svg>',
        );
      }
      return Promise.resolve(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M0 0h24v24H0z" fill="currentColor"/></svg>',
      );
    }),
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    rename: vi.fn().mockResolvedValue(undefined),
    rm: vi.fn().mockResolvedValue(undefined),
  };
});
vi.mock("fast-glob", () => {
  return {
    __esModule: true,
    default: vi
      .fn()
      .mockResolvedValue([
        `${mockAssetsDir}/media/test-icon.svg`,
        `${mockAssetsDir}/media/second-test-icon.svg`,
        `${mockAssetsDir}/action/arrow-icon.svg`,
      ]),
  };
});
vi.mock("@svgr/core", () => ({
  transform: vi
    .fn()
    .mockResolvedValue("export function Component() { return <svg />; }"),
}));
vi.mock("chalk", () => {
  const simpleLog = vi.fn((msg: string) => msg);

  return {
    __esModule: true,
    default: {
      cyan: simpleLog,
      yellow: simpleLog,
      red: simpleLog,
      green: simpleLog,
      gray: simpleLog,
    },
  };
});

vi.mock("@lib/logger", () => ({
  logger: {
    info: vi.fn(),
    detail: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));
