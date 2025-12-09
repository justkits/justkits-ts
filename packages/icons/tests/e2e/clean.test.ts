import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockClean } = vi.hoisted(() => ({
  mockClean: vi.fn(),
}));

const { mockInfo, mockSuccess } = vi.hoisted(() => ({
  mockInfo: vi.fn(),
  mockSuccess: vi.fn(),
}));

vi.mock("@scripts/builder", () => ({
  builder: {
    clean: mockClean,
  },
}));

vi.mock("@justkits/svgs-core", () => ({
  logger: {
    info: mockInfo,
    success: mockSuccess,
  },
}));

describe("clean.ts script", () => {
  const mockExit = vi
    .spyOn(process, "exit")
    .mockImplementation(vi.fn() as never);

  const consoleErrorSpy = vi
    .spyOn(console, "error")
    .mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    mockClean.mockResolvedValue(undefined);
  });

  it("should run successfully", async () => {
    // Import and execute the script
    await import("@scripts/clean");

    expect(mockInfo).toHaveBeenCalledWith("Cleaning up previous build...");
    expect(mockSuccess).toHaveBeenCalledWith("✨ Clean completed.");

    // Verify process.exit was not called (success case)
    expect(mockExit).not.toHaveBeenCalled();
  });

  it("should catch error and exit with code 1", async () => {
    const testError = new Error("Test clean error");
    mockClean.mockRejectedValue(testError);

    // Import script - this will trigger the error
    await import("@scripts/clean");

    // Wait for async error handling
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "❌ An unexpected error occurred during execution:",
    );

    // Verify process.exit was called with 1
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
