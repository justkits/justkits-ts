import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { logger } from "../logger";

export async function atomicWrite(
  filePath: string,
  content: string,
): Promise<boolean> {
  const tempFilePath = `${filePath}.tmp`;

  try {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(tempFilePath, content, "utf-8");
    await rename(tempFilePath, filePath);
    return true;
  } catch {
    logger.error(`Failed to write file atomically: ${filePath}`);
    return false;
  }
}

export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    await unlink(filePath);

    return true;
  } catch {
    logger.error(`Failed to delete file: ${filePath}`);
    return false;
  }
}
