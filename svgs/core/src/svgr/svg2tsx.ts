import { readFile } from "node:fs/promises";
import { Config, transform } from "@svgr/core";

export async function svg2tsx(
  componentName: string,
  path: string,
  options: Config,
) {
  const svgContent = await readFile(path, "utf-8");

  const componentCode = await transform(svgContent, options, { componentName });

  return componentCode;
}
