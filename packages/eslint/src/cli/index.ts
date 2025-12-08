#!/usr/bin/env node
import { Command } from "commander";

import { initAction } from "./actions";

export const program = new Command();

program
  .name("justkits-eslint")
  .description("CLI to help set up @justkits/eslint");

program
  .command("init")
  .description("Initialize eslint.config.ts with justkits presets")
  .option("--react", "Include React configuration")
  .option("--all", "Include all configurations (Base, React, JSON, Markdown)")
  .option("-f, --force", "Overwrite existing eslint.config.ts if it exists")
  .action(initAction);

// Only parse if not in test environment
/* istanbul ignore next */
if (process.env.VITEST !== "true") {
  program.parse();
}
