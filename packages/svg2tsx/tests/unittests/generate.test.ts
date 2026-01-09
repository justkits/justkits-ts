import { describe, it, expect, vi, beforeEach } from "vitest";

import { generateAction } from "@cli/generate";
import * as configLoader from "@cli/config-loader";
import { FamilySvgBuilder } from "@converter/family";
import { StandaloneSvgBuilder } from "@converter/standalone";
import { defaultOptions } from "@converter/options";
import { logger } from "@lib/logger";

vi.mock("@cli/config-loader");
vi.mock("@converter/family");
vi.mock("@converter/standalone");

describe("generateAction", () => {
  let mockExit: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  beforeEach(() => {
    vi.clearAllMocks();
    mockExit = vi.spyOn(process, "exit").mockImplementation((() => {}) as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  describe("standalone type", () => {
    it("should create StandaloneSvgBuilder and call generate", async () => {
      const mockConfig = {
        type: "standalone" as const,
        baseDir: "/test/dir",
        suffix: "Icon",
        index: true,
      };

      vi.mocked(configLoader.loadConfig).mockResolvedValue(mockConfig);

      const mockGenerate = vi.fn().mockResolvedValue(undefined);
      vi.mocked(StandaloneSvgBuilder).mockImplementation(function (
        this: any, // eslint-disable-line @typescript-eslint/no-explicit-any
      ) {
        return {
          generate: mockGenerate,
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      await generateAction({});

      expect(configLoader.loadConfig).toHaveBeenCalledWith(
        process.cwd(),
        undefined,
      );
      expect(StandaloneSvgBuilder).toHaveBeenCalledWith(
        defaultOptions,
        "/test/dir",
        "Icon",
        true,
      );
      expect(mockGenerate).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        "🚀 Starting generation (type: standalone)...",
      );
    });

    it("should use defaults when config properties are missing", async () => {
      const mockConfig = {
        type: "standalone" as const,
      };

      vi.mocked(configLoader.loadConfig).mockResolvedValue(mockConfig);

      const mockGenerate = vi.fn().mockResolvedValue(undefined);
      vi.mocked(StandaloneSvgBuilder).mockImplementation(function (
        this: any, // eslint-disable-line @typescript-eslint/no-explicit-any
      ) {
        return {
          generate: mockGenerate,
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      await generateAction({});

      expect(StandaloneSvgBuilder).toHaveBeenCalledWith(
        defaultOptions,
        process.cwd(),
        "",
        false,
      );
    });

    it("should use standalone as default when config type is undefined", async () => {
      const mockConfig = {};

      vi.mocked(configLoader.loadConfig).mockResolvedValue(mockConfig);

      const mockGenerate = vi.fn().mockResolvedValue(undefined);
      vi.mocked(StandaloneSvgBuilder).mockImplementation(function (
        this: any, // eslint-disable-line @typescript-eslint/no-explicit-any
      ) {
        return {
          generate: mockGenerate,
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      await generateAction({});

      expect(StandaloneSvgBuilder).toHaveBeenCalledWith(
        defaultOptions,
        process.cwd(),
        "",
        false,
      );
      expect(logger.info).toHaveBeenCalledWith(
        "🚀 Starting generation (type: standalone)...",
      );
    });
  });

  describe("family type", () => {
    it("should create FamilySvgBuilder and call generate", async () => {
      const mockConfig = {
        type: "family" as const,
        baseDir: "/test/dir",
        suffix: "Icon",
        index: false,
      };

      vi.mocked(configLoader.loadConfig).mockResolvedValue(mockConfig);

      const mockGenerate = vi.fn().mockResolvedValue(undefined);
      vi.mocked(FamilySvgBuilder).mockImplementation(function (
        this: any, // eslint-disable-line @typescript-eslint/no-explicit-any
      ) {
        return {
          generate: mockGenerate,
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      await generateAction({});

      expect(configLoader.loadConfig).toHaveBeenCalledWith(
        process.cwd(),
        undefined,
      );
      expect(FamilySvgBuilder).toHaveBeenCalledWith(
        defaultOptions,
        "/test/dir",
        "Icon",
        false,
      );
      expect(mockGenerate).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        "🚀 Starting generation (type: family)...",
      );
    });
  });

  describe("with custom config path", () => {
    it("should load config from specified path", async () => {
      const mockConfig = {
        type: "standalone" as const,
        baseDir: "/custom/dir",
      };

      vi.mocked(configLoader.loadConfig).mockResolvedValue(mockConfig);

      const mockGenerate = vi.fn().mockResolvedValue(undefined);
      vi.mocked(StandaloneSvgBuilder).mockImplementation(function (
        this: any, // eslint-disable-line @typescript-eslint/no-explicit-any
      ) {
        return {
          generate: mockGenerate,
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      await generateAction({ config: "custom.config.ts" });

      expect(configLoader.loadConfig).toHaveBeenCalledWith(
        process.cwd(),
        "custom.config.ts",
      );
    });
  });

  describe("error handling", () => {
    it("should handle config loading errors", async () => {
      vi.mocked(configLoader.loadConfig).mockRejectedValue(
        new Error("Config not found"),
      );

      await generateAction({});

      expect(logger.error).toHaveBeenCalledWith("❌ Generation failed:");
      expect(logger.error).toHaveBeenCalledWith("Error: Config not found");
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it("should handle builder generation errors", async () => {
      const mockConfig = {
        type: "standalone" as const,
      };

      vi.mocked(configLoader.loadConfig).mockResolvedValue(mockConfig);

      const mockGenerate = vi
        .fn()
        .mockRejectedValue(new Error("Generation failed"));
      vi.mocked(StandaloneSvgBuilder).mockImplementation(function (
        this: any, // eslint-disable-line @typescript-eslint/no-explicit-any
      ) {
        return {
          generate: mockGenerate,
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      await generateAction({});

      expect(logger.error).toHaveBeenCalledWith("❌ Generation failed:");
      expect(logger.error).toHaveBeenCalledWith("Error: Generation failed");
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe("with SVGR options", () => {
    it("should pass SVGR options to builder", async () => {
      const mockConfig = {
        type: "standalone" as const,
        baseDir: "/test/dir",
        options: {
          typescript: true,
          dimensions: false,
        },
      };

      vi.mocked(configLoader.loadConfig).mockResolvedValue(mockConfig);

      const mockGenerate = vi.fn().mockResolvedValue(undefined);
      vi.mocked(StandaloneSvgBuilder).mockImplementation(function (
        this: any, // eslint-disable-line @typescript-eslint/no-explicit-any
      ) {
        return {
          generate: mockGenerate,
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      await generateAction({});

      expect(StandaloneSvgBuilder).toHaveBeenCalledWith(
        {
          ...defaultOptions,
          typescript: true,
          dimensions: false,
        },
        "/test/dir",
        "",
        false,
      );
    });
  });
});
