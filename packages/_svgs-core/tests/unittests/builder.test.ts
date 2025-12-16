import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import fg from "fast-glob";
import { transform } from "@svgr/core";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { TestBuilder } from "../setup/TestBuilder";
import { Options } from "@/builder";
import { logger } from "@/logger";

vi.mock("node:fs/promises");
vi.mock("@/logger");

describe("BaseSvgBuilder", () => {
  const mockOptions: Options = {
    WEB: {},
    NATIVE: {},
  };
  const mockBaseDir = "/mock/base/dir";
  let builder: TestBuilder;

  beforeEach(() => {
    builder = new TestBuilder(mockOptions, mockBaseDir);
    vi.clearAllMocks();

    // Default mock implementations
    (transform as unknown as Mock).mockResolvedValue("mocked-code");
    (fg as unknown as Mock).mockResolvedValue([]);
  });

  describe("clean", () => {
    it("should remove web and native directories", async () => {
      await builder.clean();

      const srcDir = resolve(mockBaseDir, "src");
      expect(rm).toHaveBeenCalledWith(resolve(srcDir, "web"), {
        recursive: true,
        force: true,
      });
      expect(rm).toHaveBeenCalledWith(resolve(srcDir, "native"), {
        recursive: true,
        force: true,
      });
      expect(logger.detail).toHaveBeenCalledTimes(2);
    });

    it("should not log details if verbose is false", async () => {
      await builder.clean(false);
      expect(logger.detail).not.toHaveBeenCalled();
    });
  });

  describe("generate", () => {
    it("should execute the full generation pipeline", async () => {
      // Setup mocks
      const mockSvgFiles = [
        resolve(mockBaseDir, "assets/icon-one.svg"),
        resolve(mockBaseDir, "assets/icon-two.svg"),
      ];
      (fg as unknown as Mock).mockResolvedValue(mockSvgFiles);
      (readFile as unknown as Mock).mockImplementation((path) => {
        return path.endsWith("icon-one.svg")
          ? "<svg>content1</svg>"
          : "<svg>content2</svg>";
      });

      await builder.generate();

      // Verify clean was called
      expect(rm).toHaveBeenCalledTimes(2);

      // Verify processing
      expect(fg).toHaveBeenCalledWith(
        "**/*.svg",
        expect.objectContaining({ cwd: resolve(mockBaseDir, "assets") }),
      );

      // Verify transform called twice per file (web and native)
      expect(transform).toHaveBeenCalledTimes(4);

      // Verify saveComponentFile called twice (once per file)
      expect(builder.saveComponentFileSpy).toHaveBeenCalledTimes(2);
      expect(builder.saveComponentFileSpy).toHaveBeenCalledWith(
        "mocked-code",
        "mocked-code",
        "IconOne",
        mockSvgFiles[0],
      );
      expect(builder.saveComponentFileSpy).toHaveBeenCalledWith(
        "mocked-code",
        "mocked-code",
        "IconTwo",
        mockSvgFiles[1],
      );

      // Verify barrel generation
      expect(builder.generateBarrelFilesSpy).toHaveBeenCalled();

      // Verify summary
      expect(builder.printSummarySpy).toHaveBeenCalled();

      // Verify success log
      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining("Generated 2 components"),
      );
    });

    it("should throw error for invalid filenames", async () => {
      const mockSvgFiles = [resolve(mockBaseDir, "assets/Invalid_Name.svg")];
      (fg as unknown as Mock).mockResolvedValue(mockSvgFiles);

      await expect(builder.generate()).rejects.toThrow(
        'Invalid filename: "Invalid_Name"',
      );
    });

    it("should throw error for duplicate component names", async () => {
      const mockSvgFiles = [
        resolve(mockBaseDir, "assets/icon-one.svg"),
        resolve(mockBaseDir, "assets/sub/icon-one.svg"),
      ];
      (fg as unknown as Mock).mockResolvedValue(mockSvgFiles);
      (readFile as unknown as Mock).mockResolvedValue("<svg>content</svg>");

      await expect(builder.generate()).rejects.toThrow(
        "Duplicate component names found",
      );
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Duplicate component name detected: IconOne"),
      );
    });

    it("should throw error for duplicate SVG content", async () => {
      const mockSvgFiles = [
        resolve(mockBaseDir, "assets/icon-one.svg"),
        resolve(mockBaseDir, "assets/icon-two.svg"),
      ];
      (fg as unknown as Mock).mockResolvedValue(mockSvgFiles);
      (readFile as unknown as Mock).mockResolvedValue("<svg>content</svg>"); // Same content

      await expect(builder.generate()).rejects.toThrow(
        "Duplicate SVG content found",
      );
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Duplicate SVG content detected"),
      );
    });
  });

  describe("atomicWrite", () => {
    it("should write to a temp file and rename it", async () => {
      const targetFile = resolve(mockBaseDir, "src/test.ts");
      const content = "content";

      // Access public test wrapper
      await builder.testAtomicWrite(targetFile, content);

      expect(mkdir).toHaveBeenCalledWith(dirname(targetFile), {
        recursive: true,
      });
      expect(writeFile).toHaveBeenCalledWith(
        targetFile + ".tmp",
        content,
        "utf-8",
      );
      expect(rename).toHaveBeenCalledWith(targetFile + ".tmp", targetFile);
    });
  });
});
