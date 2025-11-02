import { basename, resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import fg from "fast-glob";

import { saveCache } from "@scripts/lib/cache";
import { loadIconMap } from "@scripts/lib/db";

/**
 * 주어진 디렉토리에 있는 파일들을 스캔하고, 갱신이 있는지 확인하는 스크립트
 * @param scanDir 스캔할 디렉토리 경로
 * @param filePath 데이터 파일 경로
 */
export async function scanAssets(
  scanDir: string,
  mode: "icons" | "logos",
): Promise<void> {
  const CWD = process.cwd();

  console.log("🔍 Starting scan...");

  const DB_PATH = resolve(
    CWD,
    mode === "icons" ? "db/icons-db.json" : "db/logos-db.json",
  );

  // 1. 데이터를 불러와 기존 해시맵을 생성한다.
  const oldData = loadIconMap(DB_PATH);
  const processedIconNames = new Set<string>();

  // Reports
  const added = [];
  const modified = [];
  const unchanged = [];

  // 2. 디렉토리를 순회하여, 모든 .svg 파일 경로 수집
  const svgPaths: string[] = await fg("**/*.svg", {
    cwd: scanDir,
    absolute: true,
  });
  svgPaths.sort((a, b) => a.localeCompare(b));

  // 3. 중복 검사
  const iconNames = new Map<string, string>();

  for (const filePath of svgPaths) {
    const name = basename(filePath, ".svg");
    if (iconNames.has(name)) {
      console.error(`❌ Duplicate icon name detected: ${name}`);
      console.error(`   - ${filePath}`);
      console.error(`   - ${iconNames.get(name)}`);
      console.error("Icon names must be unique.");
      process.exit(1);
    }
    iconNames.set(name, filePath);
  }

  // 4. SVG 파일들을 순회하며 해시 비교
  for (const filePath of svgPaths) {
    const iconName = basename(filePath, ".svg");
    const absolutePath = resolve(scanDir, filePath);

    processedIconNames.add(iconName);

    const newHash = await calculateHash(absolutePath);
    const oldMeta = oldData[iconName];

    if (!oldMeta) {
      // Case 1: New icon
      added.push(iconName);
    } else if (oldMeta.hash === newHash) {
      // Case 2: Unchanged icon
      unchanged.push(iconName);
    } else {
      // Case 3: Modified icon
      modified.push(iconName);
    }
  }

  // 5. 삭제된 아이콘 찾기
  const deleted = Object.keys(oldData).filter(
    (name) => !processedIconNames.has(name),
  );

  // 6. 스캔 결과 캐시에 저장
  const CACHE_PATH = resolve(
    CWD,
    mode === "icons" ? "db/icons-cache.json" : "db/logos-cache.json",
  );
  saveCache(CACHE_PATH, {
    added,
    modified,
    deleted,
    unchanged,
  });

  // 7. 결과 출력
  console.log("✅ Scan completed.");
  console.log("---");
  console.log("Scan Summary:");
  console.log(`- Added: ${added.length}`);
  console.log(`- Modified: ${modified.length}`);
  console.log(`- Deleted: ${deleted.length}`);
  console.log(`- Unchanged: ${unchanged.length}`);
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
