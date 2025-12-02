import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { initAction } from "../cli/actions";
import { allContent, baseContent, reactContent } from "../cli/content";

describe("CLI Actions", () => {
  let mockCwd: string;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockCwd = "/mock/cwd";
    vi.spyOn(process, "cwd").mockReturnValue(mockCwd);
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    processExitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initAction", () => {
    describe("when eslint.config.ts does not exist", () => {
      beforeEach(() => {
        vi.spyOn(fs, "existsSync").mockReturnValue(false);
        vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});
      });

      it("should create eslint.config.ts with base config by default", () => {
        initAction({});

        const targetFile = path.resolve(mockCwd, "eslint.config.ts");
        expect(fs.writeFileSync).toHaveBeenCalledWith(targetFile, baseContent);
        expect(consoleLogSpy).toHaveBeenCalledWith(
          "Successfully created eslint.config.ts",
        );
      });

      it("should create eslint.config.ts with react config when --react is passed", () => {
        initAction({ react: true });

        const targetFile = path.resolve(mockCwd, "eslint.config.ts");
        expect(fs.writeFileSync).toHaveBeenCalledWith(targetFile, reactContent);
        expect(consoleLogSpy).toHaveBeenCalledWith(
          "Successfully created eslint.config.ts",
        );
      });

      it("should create eslint.config.ts with all config when --all is passed", () => {
        initAction({ all: true });

        const targetFile = path.resolve(mockCwd, "eslint.config.ts");
        expect(fs.writeFileSync).toHaveBeenCalledWith(targetFile, allContent);
        expect(consoleLogSpy).toHaveBeenCalledWith(
          "Successfully created eslint.config.ts",
        );
      });

      it("should prioritize --all over --react when both are passed", () => {
        initAction({ all: true, react: true });

        const targetFile = path.resolve(mockCwd, "eslint.config.ts");
        expect(fs.writeFileSync).toHaveBeenCalledWith(targetFile, allContent);
        expect(consoleLogSpy).toHaveBeenCalledWith(
          "Successfully created eslint.config.ts",
        );
      });
    });

    describe("when eslint.config.ts already exists", () => {
      beforeEach(() => {
        vi.spyOn(fs, "existsSync").mockReturnValue(true);
      });

      it("should exit with error when --force is not passed", () => {
        initAction({});

        const targetFile = path.resolve(mockCwd, "eslint.config.ts");
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Error: ${targetFile} already exists.`,
        );
        expect(processExitSpy).toHaveBeenCalledWith(1);
      });

      it("should delete and recreate file when --force is passed", () => {
        vi.spyOn(fs, "unlinkSync").mockImplementation(() => {});
        vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});

        initAction({ force: true });

        const targetFile = path.resolve(mockCwd, "eslint.config.ts");
        expect(fs.unlinkSync).toHaveBeenCalledWith(targetFile);
        expect(consoleLogSpy).toHaveBeenCalledWith(
          `Deleted existing ${targetFile}`,
        );
        expect(fs.writeFileSync).toHaveBeenCalledWith(targetFile, baseContent);
        expect(consoleLogSpy).toHaveBeenCalledWith(
          "Successfully created eslint.config.ts",
        );
      });

      it("should delete and create react config when --force and --react are passed", () => {
        vi.spyOn(fs, "unlinkSync").mockImplementation(() => {});
        vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});

        initAction({ force: true, react: true });

        const targetFile = path.resolve(mockCwd, "eslint.config.ts");
        expect(fs.unlinkSync).toHaveBeenCalledWith(targetFile);
        expect(fs.writeFileSync).toHaveBeenCalledWith(targetFile, reactContent);
        expect(consoleLogSpy).toHaveBeenCalledWith(
          "Successfully created eslint.config.ts",
        );
      });
    });

    describe("error handling", () => {
      beforeEach(() => {
        vi.spyOn(fs, "existsSync").mockReturnValue(false);
      });

      it("should handle write errors gracefully", () => {
        const error = new Error("Write error");
        vi.spyOn(fs, "writeFileSync").mockImplementation(() => {
          throw error;
        });

        initAction({});

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Failed to create configuration file:",
          error,
        );
        expect(processExitSpy).toHaveBeenCalledWith(1);
      });
    });
  });
});
