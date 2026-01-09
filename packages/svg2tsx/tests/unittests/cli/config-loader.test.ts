import { describe, it, expect, vi, beforeEach } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createJiti } from "jiti";

import { loadConfig } from "@cli/config-loader";
import { SvgsConfig } from "@cli/types";
import {
  defaultConfig,
  mockBaseDir,
  mockConfigInput,
  mockConfigOutput,
} from "@tests/setup/mocks";

vi.mock("node:fs");
vi.mock("jiti");

describe("loadConfig", () => {
  const mockJiti = {
    import: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(process, "cwd").mockReturnValue(mockBaseDir);
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(createJiti).mockReturnValue(mockJiti as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    mockJiti.import.mockResolvedValue({ default: mockConfigInput });
  });

  describe("config file from configPath path", () => {
    it("should load config from configPath path", async () => {
      const result = await loadConfig("custom.config.ts");

      expect(result).toEqual(mockConfigOutput);
      expect(existsSync).toHaveBeenCalledWith(
        resolve(mockBaseDir, "custom.config.ts"),
      );
    });

    it("should return default config when file does not exist", async () => {
      vi.mocked(existsSync).mockReturnValueOnce(false);

      const result = await loadConfig("nonexistent.config.ts");

      expect(result).toEqual(defaultConfig);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("file not found at nonexistent.config.ts"),
      );
    });
  });

  describe("config file from default path", () => {
    it("should load config from default path", async () => {
      const result = await loadConfig();

      expect(result).toEqual(mockConfigOutput);
      expect(existsSync).toHaveBeenCalledWith(
        resolve(mockBaseDir, "svg2tsx.config.ts"),
      );
    });

    it("should return default config when no config file exists", async () => {
      vi.mocked(existsSync).mockReturnValueOnce(false);

      const result = await loadConfig();

      expect(result).toEqual(defaultConfig);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("file not found at svg2tsx.config.ts"),
      );
    });
  });

  describe("config file corner cases", () => {
    it("should handle config file without default export", async () => {
      const configWithoutDefault: SvgsConfig = {
        type: "family",
      };
      mockJiti.import.mockResolvedValueOnce(configWithoutDefault);

      const result = await loadConfig();

      expect(result).toEqual({
        baseDir: mockBaseDir,
        type: "family",
      });
    });

    it("should allow config to override baseDir when specified", async () => {
      const configWithBaseDir: SvgsConfig = {
        type: "family",
        baseDir: "/custom/override/path",
      };
      mockJiti.import.mockResolvedValueOnce({ default: configWithBaseDir });

      const result = await loadConfig("custom.config.ts");

      expect(result.baseDir).toBe("/custom/override/path");
    });

    it("should throw error when config file fails to load", async () => {
      mockJiti.import.mockRejectedValueOnce(new Error("Invalid syntax"));

      await expect(loadConfig("invalid.config.ts")).rejects.toThrow(
        "Failed to load config",
      );
    });
  });
});
