import { readFile } from "node:fs/promises";
import { Config, transform } from "@svgr/core";

import { logger } from "@lib/logger";

export async function svg2tsx(
  componentName: string,
  path: string,
  options: Config,
): Promise<string | null> {
  try {
    const svgContent = await readFile(path, "utf-8");

    const componentCode = await transform(svgContent, options, {
      componentName,
    });

    return componentCode;
  } catch {
    logger.error(`Failed to convert SVG to TSX: ${path}`);
    return null;
  }
}
