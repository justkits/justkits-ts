import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export async function atomicWrite(
  filePath: string,
  content: string,
): Promise<void> {
  const tempFilePath = `${filePath}.tmp`;

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(tempFilePath, content, "utf-8");
  await rename(tempFilePath, filePath);
}
