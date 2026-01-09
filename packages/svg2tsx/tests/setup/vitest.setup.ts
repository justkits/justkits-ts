import { vi } from "vitest";

import { mockAssetsDir } from "./mocks";

vi.mock("node:fs/promises", async (importOriginal) => {
  const original = await importOriginal<typeof import("node:fs/promises")>();
  return {
    ...original,
    readFile: vi.fn().mockImplementation((filePath: string) => {
      const fileName = filePath.split("/").pop() || "";
      if (fileName === "test.svg") {
        return Promise.resolve(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 2L2 12h10v10h10V12h10L12 2z" fill="currentColor"/></svg>',
        );
      } else if (fileName === "second-test.svg") {
        return Promise.resolve(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>',
        );
      } else if (fileName === "arrow.svg") {
        return Promise.resolve(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 2L22 12L12 22L2 12z" fill="currentColor"/></svg>',
        );
      }
      return Promise.resolve(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M0 0h24v24H0z" fill="currentColor"/></svg>',
      );
    }),
    rm: vi.fn().mockResolvedValue(undefined),
  };
});
vi.mock("fast-glob", () => {
  return {
    __esModule: true,
    default: vi
      .fn()
      .mockResolvedValue([
        `${mockAssetsDir}/media/test.svg`,
        `${mockAssetsDir}/media/second-test.svg`,
        `${mockAssetsDir}/action/arrow.svg`,
      ]),
  };
});
vi.mock("@svgr/core", () => ({
  transform: vi
    .fn()
    .mockResolvedValue("export function Component() { return <svg />; }"),
}));

vi.mock("@lib/atomicWrite", () => ({
  atomicWrite: vi.fn().mockResolvedValue(undefined),
}));
// kebab-to-pascal은 굳이 mock 하지 않는다.
vi.mock("@lib/logger", () => ({
  logger: {
    info: vi.fn(),
    detail: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));
