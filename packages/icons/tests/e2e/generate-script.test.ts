import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGenerate, mockAssetsDir } = vi.hoisted(() => ({
  mockGenerate: vi.fn(),
  mockAssetsDir: "/mock/assets/dir",
}));

const { mockInfo, mockError, mockSuccess, mockDetail } = vi.hoisted(() => ({
  mockInfo: vi.fn(),
  mockError: vi.fn(),
  mockSuccess: vi.fn(),
  mockDetail: vi.fn(),
}));

vi.mock("@scripts/builder", () => ({
  builder: {
    generate: mockGenerate,
    ASSETS_DIR: mockAssetsDir,
  },
}));

vi.mock("@justkits/svgs-core", () => ({
  logger: {
    info: mockInfo,
    error: mockError,
    success: mockSuccess,
    detail: mockDetail,
  },
}));

describe("generate.ts script", () => {
  const mockExit = vi
    .spyOn(process, "exit")
    .mockImplementation((() => {}) as any); // eslint-disable-line @typescript-eslint/no-explicit-any

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    mockGenerate.mockResolvedValue(undefined);
  });

  it("should run successfully", async () => {
    // Import and execute the script
    await import("@scripts/generate");

    expect(mockInfo).toHaveBeenCalledWith("🚀 [Build Started] @justkits/icons");

    // Verify process.exit was not called (success case)
    expect(mockExit).not.toHaveBeenCalled();
  });

  it("should catch error and exit with code 1", async () => {
    const testError = new Error("Test generation error");
    mockGenerate.mockRejectedValue(testError);

    // Import script - this will trigger the error
    await import("@scripts/generate");

    // Wait for async error handling
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockError).toHaveBeenCalledWith(
      "❌ An unexpected error occurred during execution:",
    );

    // Verify process.exit was called with 1
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
