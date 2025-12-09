import chalk from "chalk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { logger } from "@/logger";

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
vi.unmock("@lib/logger");

describe("logger", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should log info messages in cyan", () => {
    const message = "This is an info message";
    logger.info(message);
    expect(consoleLogSpy).toHaveBeenCalledWith(message);
    expect(chalk.cyan).toHaveBeenCalledWith(message);
  });

  it("should log detail messages in gray", () => {
    const message = "This is a detail message";
    logger.detail(message);
    expect(consoleLogSpy).toHaveBeenCalledWith("   ", message);
    expect(chalk.gray).toHaveBeenCalledWith(message);
  });

  it("should log warning messages in yellow with a warning icon", () => {
    const message = "This is a warning message";
    logger.warn(message);
    expect(consoleWarnSpy).toHaveBeenCalledWith("⚠️", message);
    expect(chalk.yellow).toHaveBeenCalledWith(message);
  });

  it("should log error messages in red with an error icon", () => {
    const message = "This is an error message";
    logger.error(message);
    expect(consoleErrorSpy).toHaveBeenCalledWith("❌", message);
    expect(chalk.red).toHaveBeenCalledWith(message);
  });

  it("should log success messages in green with a success icon", () => {
    const message = "This is a success message";
    logger.success(message);
    expect(consoleLogSpy).toHaveBeenCalledWith("✅", message);
    expect(chalk.green).toHaveBeenCalledWith(message);
  });
});
