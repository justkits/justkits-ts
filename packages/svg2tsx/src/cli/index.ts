#!/usr/bin/env node

import { Command } from "commander";

import { generateAction } from "./generate";

const program = new Command();

program
  .name("svg2tsx")
  .description("JustKits SVG2TSX CLI to generate React components from SVGs")
  .version("1.1.1");

program
  .command("generate")
  .description("Generate React components from SVG files")
  .option("-c, --config <path>", "path to config file")
  .action(generateAction);

program.parse();
