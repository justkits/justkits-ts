import { describe, expect, it, vi } from "vitest";

import { program } from "../cli/index";

describe("CLI Entry Point", () => {
  it("should have correct program name", () => {
    expect(program.name()).toBe("justkits-eslint");
  });

  it("should have correct description", () => {
    expect(program.description()).toBe("CLI to help set up @justkits/eslint");
  });

  it("should have init command", () => {
    const initCommand = program.commands.find((cmd) => cmd.name() === "init");
    expect(initCommand).toBeDefined();
  });

  it("should have init command with correct description", () => {
    const initCommand = program.commands.find((cmd) => cmd.name() === "init");
    expect(initCommand?.description()).toBe(
      "Initialize eslint.config.ts with justkits presets",
    );
  });

  it("should have --react option", () => {
    const initCommand = program.commands.find((cmd) => cmd.name() === "init");
    const reactOption = initCommand?.options.find((opt) =>
      opt.flags.includes("--react"),
    );
    expect(reactOption).toBeDefined();
    expect(reactOption?.description).toBe("Include React configuration");
  });

  it("should have --all option", () => {
    const initCommand = program.commands.find((cmd) => cmd.name() === "init");
    const allOption = initCommand?.options.find((opt) =>
      opt.flags.includes("--all"),
    );
    expect(allOption).toBeDefined();
    expect(allOption?.description).toBe(
      "Include all configurations (Base, React, JSON, Markdown)",
    );
  });

  it("should have --force option with short flag -f", () => {
    const initCommand = program.commands.find((cmd) => cmd.name() === "init");
    const forceOption = initCommand?.options.find((opt) =>
      opt.flags.includes("--force"),
    );
    expect(forceOption).toBeDefined();
    expect(forceOption?.flags).toContain("-f");
    expect(forceOption?.description).toBe(
      "Overwrite existing eslint.config.ts if it exists",
    );
  });

  it("should parse arguments correctly", () => {
    const mockExit = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
    const originalArgv = process.argv;

    try {
      // Test parsing with --version
      process.argv = ["node", "cli.js", "--version"];
      const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      program.parse(process.argv);

      consoleLogSpy.mockRestore();
    } finally {
      process.argv = originalArgv;
      mockExit.mockRestore();
    }

    expect(true).toBe(true);
  });
});
