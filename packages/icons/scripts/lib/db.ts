import fs from "node:fs";
import { dirname, resolve } from "node:path";

type IconData = {
  path: string; // 출력 경로
  createdAt: string;
  updatedAt: string;
};

type IconMeta = {
  hash: string; // svg 파일 해시
  family: string;
  componentName: string;
  deprecated: boolean;
  outputs: {
    web: IconData | null;
    native: IconData | null;
  };
};

const DB_PATH = resolve(process.cwd(), "db/icons-map.json");

type ScanResult = "NEW" | "MODIFIED" | "UNCHANGED" | "HASH_COLLISION";

export class IconRegistry {
  private iconsByName: Record<string, IconMeta> = {}; // name -> metadata
  private iconsByHash: Record<string, string> = {}; // hash -> icon name

  // 초기에 데이터 로드
  constructor() {
    if (fs.existsSync(DB_PATH)) {
      const rawMap = fs.readFileSync(DB_PATH, "utf-8");
      this.iconsByName = JSON.parse(rawMap);

      for (const [name, meta] of Object.entries(this.iconsByName)) {
        this.iconsByHash[meta.hash] = name;
      }
    } else {
      console.warn("IconRegistry: DB file not found, starting fresh.");
    }
  }

  save() {
    const dir = dirname(DB_PATH);
    fs.mkdirSync(dir, { recursive: true });

    // Save iconsByName
    const tmpMap = `${dir}/.tmp-icons-map-${Date.now()}.json`;
    fs.writeFileSync(
      tmpMap,
      JSON.stringify(this.iconsByName, null, 2),
      "utf-8",
    );
    fs.renameSync(tmpMap, DB_PATH);
  }

  check(name: string, hash: string): ScanResult {
    const existingByName = this.iconsByName[name];
    const existingNameByHash = this.iconsByHash[hash];

    if (existingByName) {
      if (existingByName.hash === hash) {
        // 이름과 해시 모두 동일 -> 변경 없음
        return "UNCHANGED";
      } else {
        // 이름은 동일하지만 해시가 다름 -> 수정된 아이콘
        return "MODIFIED";
      }
    }

    if (existingNameByHash) {
      // 해시가 같은 다른 이름의 아이콘이 존재
      console.warn(
        `❌ Hash collision detected for icon: ${name} with existing icon: ${existingNameByHash}`,
      );
      return "HASH_COLLISION";
    }

    return "NEW";
  }

  getIconNames(): Set<string> {
    return new Set(Object.keys(this.iconsByName));
  }
}
