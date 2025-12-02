import { vi } from "vitest";

vi.mock("node:fs/promises", () => ({
  __esModule: true,
  default: {
    readdir: vi.fn(),
  },
  readdir: vi.fn(),
}));
vi.mock("@scripts/config", () => ({
  PATHS: {
    DATABASE: "/mocked/path/database.json",
    ASSETS: "/mocked/path/assets",
    SRC: "/mocked/path/src",
  },
}));
