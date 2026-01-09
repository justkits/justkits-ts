import { resolve } from "node:path";

import { SvgsConfig } from "@cli/types";

export const mockBaseDir = "/mock/base/dir";
export const mockAssetsDir = resolve(mockBaseDir, "assets");

export const mockConfigInput: SvgsConfig = {
  type: "family",
  suffix: "Icon",
  index: true,
};
export const mockConfigOutput: SvgsConfig = {
  ...mockConfigInput,
  baseDir: mockBaseDir,
};
export const defaultConfig: SvgsConfig = {
  type: "standalone",
  baseDir: mockBaseDir,
};
