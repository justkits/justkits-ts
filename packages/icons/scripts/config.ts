import { resolve } from "node:path";

const CWD = process.cwd(); // 패키지 루트에서 실행된다고 가정.

export const PATHS = {
  DATABASE: resolve(CWD, ".icon-cache.json"),
  ASSETS: resolve(CWD, "assets"),
  SRC: resolve(CWD, "src"),
};
