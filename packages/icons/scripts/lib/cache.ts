import fs from "node:fs";
import { dirname, resolve } from "node:path";

// 아이콘 생성/수정/삭제에 필요한 임시 캐시 관리 모듈 //

// --------------- 경로 ---------------- //
const CACHE_PATH = resolve(process.cwd(), "cache/changesets.json");

// ---------- 타입 정의 ---------- //
export type CacheItem = {
  name: string;
  path: string; // svg 파일 경로 (절대경로)
  hash: string;
  warnings: string[];
};

export type IconsDiff = {
  added: CacheItem[];
  modified: CacheItem[];
  deleted: CacheItem[];
  unchanged: CacheItem[];
};

// ---------- 캐시 로드/저장 함수 ---------- //

/**
 * 캐시를 불러오는 함수
 * @return 캐시 데이터 또는 null (캐시 파일이 없을 경우)
 */
export function loadCache(): IconsDiff | null {
  if (!fs.existsSync(CACHE_PATH)) {
    return null;
  }

  const data = fs.readFileSync(CACHE_PATH, "utf-8");
  return JSON.parse(data);
}

/**
 * 캐시를 저장하는 함수
 * @param data 저장할 캐시 데이터
 */
export function saveCache(data: IconsDiff): void {
  const dir = dirname(CACHE_PATH);

  // 원자적 쓰기 보장을 위해 임시 파일에 먼저 쓰고, rename 한다.
  const tmp = `${dir}/.tmp-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}.json`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmp, CACHE_PATH);
}

/**
 * 캐시를 초기화하는 함수 (캐시 파일 삭제)
 */
export function clearCache(): void {
  if (fs.existsSync(CACHE_PATH)) {
    fs.unlinkSync(CACHE_PATH);
  }
}
