import { vi } from "vitest";

export const readFile: ReturnType<typeof vi.fn> = vi.fn();
export const mkdir: ReturnType<typeof vi.fn> = vi.fn();
export const writeFile: ReturnType<typeof vi.fn> = vi.fn();
export const rename: ReturnType<typeof vi.fn> = vi.fn();
export const rm: ReturnType<typeof vi.fn> = vi.fn();
