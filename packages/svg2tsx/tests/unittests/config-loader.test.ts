import { describe, it, expect, vi, beforeEach } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createJiti } from "jiti";

import { loadConfig } from "@cli/config-loader";
import { SvgsConfig } from "@cli/types";

vi.mock("node:fs");
vi.mock("jiti");

describe("loadConfig", () => {
  const mockCwd = "/test/cwd";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("with explicit path", () => {
    it("should load config from explicit path", async () => {
      const mockConfig: SvgsConfig = {
        type: "family",
        suffix: "Icon",
        index: true,
      };

      vi.mocked(existsSync).mockReturnValue(true);
      const mockJiti = {
        import: vi.fn().mockResolvedValue({ default: mockConfig }),
      };
      vi.mocked(createJiti).mockReturnValue(mockJiti as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      const result = await loadConfig(mockCwd, "custom.config.ts");

      expect(result).toEqual({
        baseDir: mockCwd,
        type: "family",
        suffix: "Icon",
        index: true,
      });
      expect(existsSync).toHaveBeenCalledWith(
        resolve(mockCwd, "custom.config.ts"),
      );
    });

    it("should handle config without default export", async () => {
      const mockConfig: SvgsConfig = {
        type: "standalone",
      };

      vi.mocked(existsSync).mockReturnValue(true);
      const mockJiti = {
        import: vi.fn().mockResolvedValue(mockConfig),
      };
      vi.mocked(createJiti).mockReturnValue(mockJiti as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      const result = await loadConfig(mockCwd, "custom.config.ts");

      expect(result).toEqual({
        baseDir: mockCwd,
        type: "standalone",
      });
    });

    it("should throw error when config file fails to load", async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      const mockJiti = {
        import: vi.fn().mockRejectedValue(new Error("Invalid syntax")),
      };
      vi.mocked(createJiti).mockReturnValue(mockJiti as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      await expect(loadConfig(mockCwd, "invalid.config.ts")).rejects.toThrow(
        "Failed to load config",
      );
    });

    it("should return default config when explicit path does not exist", async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const result = await loadConfig(mockCwd, "nonexistent.config.ts");

      expect(result).toEqual({
        type: "standalone",
        baseDir: mockCwd,
      });
    });
  });

  describe("with default path", () => {
    it("should load config from default path when no explicit path provided", async () => {
      const mockConfig: SvgsConfig = {
        type: "family",
      };

      vi.mocked(existsSync).mockReturnValue(true);
      const mockJiti = {
        import: vi.fn().mockResolvedValue({ default: mockConfig }),
      };
      vi.mocked(createJiti).mockReturnValue(mockJiti as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      const result = await loadConfig(mockCwd);

      expect(result).toEqual({
        baseDir: mockCwd,
        type: "family",
      });
      expect(existsSync).toHaveBeenCalledWith(
        resolve(mockCwd, "svg2tsx.config.ts"),
      );
    });

    it("should return default config when no config file exists", async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const result = await loadConfig(mockCwd);

      expect(result).toEqual({
        type: "standalone",
        baseDir: mockCwd,
      });
    });

    it("should use process.cwd() when no cwd argument provided", async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const result = await loadConfig();

      expect(result.baseDir).toBe(process.cwd());
      expect(result.type).toBe("standalone");
    });
  });

  describe("config merging", () => {
    it("should allow config to override baseDir when specified", async () => {
      const mockConfig: SvgsConfig = {
        type: "family",
        baseDir: "/custom/override/path",
      };

      vi.mocked(existsSync).mockReturnValue(true);
      const mockJiti = {
        import: vi.fn().mockResolvedValue({ default: mockConfig }),
      };
      vi.mocked(createJiti).mockReturnValue(mockJiti as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      const result = await loadConfig(mockCwd, "custom.config.ts");

      expect(result.baseDir).toBe("/custom/override/path");
    });
  });
});
