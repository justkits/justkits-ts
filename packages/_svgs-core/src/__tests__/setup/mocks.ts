import { vi } from "vitest";

vi.mock("@lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));
vi.mock("@lib/storage", async (importOriginal) => {
  const original = await importOriginal<typeof import("@lib/storage")>();
  return {
    ...original,
    atomicWrite: vi.fn(original.atomicWrite),
  };
});

vi.mock("node:fs/promises", async (importOriginal) => {
  const original = await importOriginal<typeof import("node:fs/promises")>();
  return {
    ...original,
    readFile: vi.fn(original.readFile),
  };
});
