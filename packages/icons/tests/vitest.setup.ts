import { vi } from "vitest";

vi.mock("node:fs/promises", () => ({
  __esModule: true,
  default: {
    readdir: vi.fn(),
  },
  readdir: vi.fn(),
}));
