import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * 파일을 원자적으로 작성 (먼저 .tmp 파일에 쓴 후 rename하여 부분적인 쓰기를 방지)
 *
 * @param filePath - 대상 파일 경로
 * @param content - 파일에 쓸 내용
 *
 * @throws {Error} 파일 쓰기 중 오류가 발생한 경우
 */
export async function atomicWrite(
  filePath: string,
  content: string,
): Promise<void> {
  const tempFilePath = `${filePath}.tmp`;

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(tempFilePath, content, "utf-8");

  try {
    await rename(tempFilePath, filePath);
  } catch (error) {
    await rm(tempFilePath, { force: true });
    throw error;
  }
}
