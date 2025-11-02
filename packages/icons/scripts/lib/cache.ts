import fs from "node:fs";
import path from "node:path";

type OutputType = {
  path: string; // 출력 경로
  componentName: string;
  createdAt: string;
  updatedAt: string;
  deprecated: boolean;
};

type IconMeta = {
  hash: string;
  family: string;
  outputs: {
    web: OutputType | null;
    native: OutputType | null;
  };
};

// 타입 정의
export type IconMap = Record<string, IconMeta>; // key = 아이콘 이름

/**
 * 이전 아이콘 캐시 로드
 * @returns 이전 아이콘 캐시
 */
export function loadIconCache(cacheFilePath: string): IconMap {
  if (!fs.existsSync(cacheFilePath)) return {};
  try {
    const raw = JSON.parse(fs.readFileSync(cacheFilePath, "utf-8"));
    if (raw && typeof raw === "object") return raw as IconMap;
  } catch {
    // 무시
  }
  return {};
}

/**
 * 아이콘 캐시 저장
 * @param cache 저장할 아이콘 캐시
 */
export function updateIconCache(cache: IconMap, cacheFilePath: string): void {
  const dir = path.dirname(cacheFilePath);
  const tmp = path.join(
    dir,
    `.tmp-${Date.now()}-${Math.random().toString(16).slice(2)}.json`,
  );
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(tmp, JSON.stringify(cache, null, 2), "utf-8");
  fs.renameSync(tmp, cacheFilePath);
}
