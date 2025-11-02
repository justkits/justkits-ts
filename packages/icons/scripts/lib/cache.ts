import fs from "node:fs";
import { dirname } from "node:path";

type IconsDiff = {
  added: string[];
  modified: string[];
  deleted: string[];
  unchanged: string[];
};

export function saveCache(filePath: string, data: IconsDiff): void {
  const dir = dirname(filePath);
  const tmp = `${dir}/.tmp-${Date.now()}-${Math.random().toString(16).slice(2)}.json`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmp, filePath);
}
