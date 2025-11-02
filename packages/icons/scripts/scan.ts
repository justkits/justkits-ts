import { resolve } from "node:path";
import { Command } from "commander";

import { parsePath } from "./lib/parsers";
import { scanAssets } from "./tools/scanAssets";

/**
 * Assets 디렉토리를 스캔하고, 아이콘의 변경사항을 감지하는 스크립트
 *   - argument로 디렉토리가 들어올 수도, 모드가 들어올 수도 있다.
 *   - 둘 다 없으면 전체 디렉토리를 스캔하고,
 *   - 둘 다 지정하면, mode만 해석하여 스캔한다.
 *   - --mode / -m : 스캔 모드 (default: "all", options: "icons" | "logos" | "all")
 *   - --dir / -d : 스캔할 디렉토리 (default: "assets", examples: "assets/icons", "assets/logos")
 */
async function main() {
  const CWD = process.cwd();
  const program = new Command();

  program
    .option("-m, --mode <mode>", "Scan mode (icons, logos, all)", "all")
    .option("-d, --dir <dir>", "Directory to scan for assets")
    .parse(process.argv);

  const options = program.opts();

  let scanned = false;

  if (options.mode === "icons" || options.mode === "all") {
    const scanDir = resolve(CWD, "assets/icons");
    await scanAssets(scanDir, "icons");
    scanned = true;
  }
  if (options.mode === "logos" || options.mode === "all") {
    const scanDir = resolve(CWD, "assets/logos");
    await scanAssets(scanDir, "logos");
    scanned = true;
  }

  if (scanned) {
    process.exit(0);
  }

  if (options.dir) {
    const { mode, scanDir } = parsePath(options.dir);

    if (mode === "icons" || mode === "all") {
      await scanAssets(scanDir, "icons");
      process.exit(0);
    }
    if (mode === "logos" || mode === "all") {
      await scanAssets(scanDir, "logos");
      process.exit(0);
    }
  }

  console.error("❌ No valid mode or directory specified for scanning.");
  process.exit(1);
}

// --- Execution ---
try {
  await main();
} catch (error) {
  console.error("❌ An error occurred during asset scanning:");
  console.error(error);
  process.exit(1);
}
