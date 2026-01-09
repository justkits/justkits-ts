import { describe, it, expect, vi, beforeEach } from "vitest";

import { generateAction } from "@cli/generate";
import { loadConfig } from "@cli/config-loader";
import { FamilySvgBuilder } from "@converter/family";
import { StandaloneSvgBuilder } from "@converter/standalone";
import { logger } from "@lib/logger";
import { defaultConfig, mockConfigOutput } from "@tests/setup/mocks";

vi.mock("@cli/config-loader");
vi.mock("@converter/family");
vi.mock("@converter/standalone");
vi.mock("@lib/logger");

type MockBuilder = {
  generate: () => Promise<void>;
};

describe("generateAction", () => {
  const mockGenerate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

    vi.mocked(FamilySvgBuilder).mockImplementation(function (
      this: MockBuilder,
    ) {
      return {
        generate: mockGenerate,
      };
    } as unknown as typeof FamilySvgBuilder);

    vi.mocked(StandaloneSvgBuilder).mockImplementation(function (
      this: MockBuilder,
    ) {
      return {
        generate: mockGenerate,
      };
    } as unknown as typeof StandaloneSvgBuilder);

    vi.mocked(loadConfig).mockResolvedValue(mockConfigOutput);
    mockGenerate.mockResolvedValue(undefined);
  });

  describe("family type generation", () => {
    it("should generate with family builder", async () => {
      await generateAction({ config: "svg2tsx.config.ts" });

      expect(loadConfig).toHaveBeenCalledWith("svg2tsx.config.ts");
      expect(FamilySvgBuilder).toHaveBeenCalledWith(
        expect.any(Object),
        mockConfigOutput.baseDir,
        mockConfigOutput.suffix,
        mockConfigOutput.index,
      );
      expect(mockGenerate).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("type: family"),
      );
    });

    it("should use default values when config values are missing", async () => {
      vi.mocked(loadConfig).mockResolvedValueOnce({
        type: "family",
        baseDir: "/test/path",
      });

      await generateAction({});

      expect(FamilySvgBuilder).toHaveBeenCalledWith(
        expect.any(Object),
        "/test/path",
        "",
        false,
      );
    });
  });

  describe("standalone type generation", () => {
    it("should generate with standalone builder", async () => {
      vi.mocked(loadConfig).mockResolvedValueOnce(defaultConfig);

      await generateAction({});

      expect(loadConfig).toHaveBeenCalledWith(undefined);
      expect(StandaloneSvgBuilder).toHaveBeenCalledWith(
        expect.any(Object),
        defaultConfig.baseDir,
        "",
        false,
      );
      expect(mockGenerate).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("type: standalone"),
      );
    });

    it("should use process.cwd() when baseDir is not specified", async () => {
      vi.mocked(loadConfig).mockResolvedValueOnce({
        type: "standalone",
      });

      await generateAction({});

      expect(StandaloneSvgBuilder).toHaveBeenCalledWith(
        expect.any(Object),
        process.cwd(),
        "",
        false,
      );
    });

    it("should default to standalone when type is undefined", async () => {
      vi.mocked(loadConfig).mockResolvedValueOnce({
        baseDir: "/test/path",
      });

      await generateAction({});

      expect(StandaloneSvgBuilder).toHaveBeenCalledWith(
        expect.any(Object),
        "/test/path",
        "",
        false,
      );
      expect(logger.info).toHaveBeenCalledWith(
        "🚀 Starting generation (type: standalone)...",
      );
    });
  });

  describe("error handling", () => {
    it("should handle config loading error", async () => {
      const error = new Error("Config load failed");
      vi.mocked(loadConfig).mockRejectedValueOnce(error);

      await generateAction({ config: "invalid.config.ts" });

      expect(logger.error).toHaveBeenCalledWith("❌ Generation failed:");
      expect(logger.error).toHaveBeenCalledWith("Error: Config load failed");
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it("should handle generation error", async () => {
      const error = new Error("Generation failed");
      mockGenerate.mockRejectedValueOnce(error);

      await generateAction({});

      expect(logger.error).toHaveBeenCalledWith("❌ Generation failed:");
      expect(logger.error).toHaveBeenCalledWith("Error: Generation failed");
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it("should handle non-Error objects", async () => {
      mockGenerate.mockRejectedValueOnce("String error");

      await generateAction({});

      expect(logger.error).toHaveBeenCalledWith("❌ Generation failed:");
      expect(logger.error).toHaveBeenCalledWith("String error");
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe("config options merging", () => {
    it("should merge svgr options from config", async () => {
      vi.mocked(loadConfig).mockResolvedValueOnce({
        type: "family",
        baseDir: "/test",
        options: {
          typescript: true,
          dimensions: false,
        },
      });

      await generateAction({});

      expect(FamilySvgBuilder).toHaveBeenCalledWith(
        expect.objectContaining({
          typescript: true,
          dimensions: false,
        }),
        "/test",
        "",
        false,
      );
    });
  });
});
