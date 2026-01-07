#!/usr/bin/env node
import { Command } from "commander";
import {
  FamilySvgBuilder,
  StandaloneSvgBuilder,
  defaultOptions,
  logger,
} from "@justkits/svgs-core";
import { loadConfig } from "./config-loader";

const program = new Command();

program
  .name("svgs")
  .description("JustKits SVGs CLI to generate React components from SVGs")
  .version("1.0.0");

program
  .command("generate")
  .description("Generate React components from SVG files")
  .option("-c, --config <path>", "path to config file")
  .action(async (options) => {
    try {
      const cwd = process.cwd();
      const config = await loadConfig(cwd, options.config);

      const svgrOptions = {
        ...defaultOptions,
        ...config.options,
      };

      const baseDir = config.baseDir || cwd;
      const suffix = config.suffix || "";

      let builder;
      if (config.type === "family") {
        builder = new FamilySvgBuilder(svgrOptions, baseDir, suffix);
      } else {
        builder = new StandaloneSvgBuilder(svgrOptions, baseDir, suffix);
      }

      logger.info(
        `🚀 Starting generation (type: ${config.type || "standalone"})...`,
      );
      await builder.generate();
    } catch (error) {
      logger.error("❌ Generation failed:");
      logger.error(String(error));
      process.exit(1);
    }
  });

program.parse();
