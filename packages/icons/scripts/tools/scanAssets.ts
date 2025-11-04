import { createHash } from "node:crypto";
import { basename, resolve } from "node:path";
import { readFile } from "node:fs/promises";
import fg from "fast-glob";

import { CacheItem, IconsDiff, saveCache } from "@scripts/lib/cache";
import { IconRegistry } from "@scripts/lib/db";

/**
 * Assets 디렉토리를 스캔하고, 아이콘의 변경사항 감지하여, 캐시에 저장
 *  -> 특정 디렉토리만 스캔하도록 할 수도 있다.
 * @param dir 스캔할 디렉토리 경로 (유저가 지정한 경로 그대로 전달)
 */

export async function scanAssets(dir: string) {
  const CWD = process.cwd();

  // 1단계: 경로 파싱
  if (!dir.includes("assets")) {
    // 오류.
    console.error(
      "Invalid directory. Please provide a directory within the 'assets' folder.",
    );
    process.exit(1);
  }

  const scanDir = resolve(CWD, dir);

  console.log(`🔍 Scanning for changes in icons from ${dir}...`);

  // 2단계: 스캔에 필요한 자료구조를 준비한다.
  const registry = new IconRegistry();
  const iconNames = new Set<string>();

  const added: CacheItem[] = [];
  const modified: CacheItem[] = [];
  const deleted: CacheItem[] = [];
  const unchanged: CacheItem[] = [];

  // 3단계: SVG 파일들을 수집
  const svgPaths: string[] = await fg("**/*.svg", {
    cwd: scanDir,
    absolute: true,
  });
  svgPaths.sort((a, b) => a.localeCompare(b));

  // 4단계: SVG 파일들을 순회하며 해시 비교
  for (const filePath of svgPaths) {
    const iconName = basename(filePath, ".svg");

    // 중복검사 먼저 (중복이 있으면 바로 종료)
    if (iconNames.has(iconName)) {
      console.error(`❌ Duplicate icon name detected: ${iconName}`);
      console.error(`   - ${filePath}`);
      console.error(
        `   - ${Array.from(iconNames).find((name) => name === iconName)}`,
      );
      console.error("Icon names must be unique.");
      process.exit(1);
    }

    iconNames.add(iconName);

    // 중복이 없으면, 기존 데이터와 해시 비교
    const absolutePath = resolve(scanDir, filePath);
    const newHash = await calculateHash(absolutePath);

    const result = registry.check(iconName, newHash);

    const item: CacheItem = {
      name: iconName,
      path: absolutePath,
      hash: newHash,
      warnings: [],
    };

    if (result === "NEW") {
      added.push(item);
    } else if (result === "MODIFIED") {
      modified.push(item);
    } else {
      unchanged.push(item);
    }

    if (result === "HASH_COLLISION") {
      item.warnings.push("Hash collision detected with existing icon.");
    }
  }

  // 5단계: 삭제된 아이콘 찾기
  for (const existingName of registry.getIconNames()) {
    if (!iconNames.has(existingName)) {
      const item: CacheItem = {
        name: existingName,
        path: "",
        hash: "",
        warnings: [],
      };
      deleted.push(item);
    }
  }

  // 6단계: 스캔 결과 캐시에 저장
  const diff: IconsDiff = {
    added,
    modified,
    deleted,
    unchanged,
  };
  saveCache(diff);

  // 7단계: 결과 반환
  return diff;
}

/**
 * Calculates the SHA-256 hash of a file's content.
 * @param filePath The path to the file.
 * @returns The hex-encoded hash.
 */
async function calculateHash(filePath: string): Promise<string> {
  const fileBuffer = await readFile(filePath);
  return createHash("sha256").update(fileBuffer).digest("hex");
}
