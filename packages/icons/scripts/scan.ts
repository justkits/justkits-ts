import { Command } from "commander";

import { scanAssets } from "@scripts/tools/scanAssets";

/**
 * 전체 프로세스 중, 스캔만 진행하고 싶을 때 사용하는 스크립트
 */
async function main() {
  const program = new Command();

  const startTime = Date.now();

  program
    .option("-d, --dir <dir>", "Directory to scan for assets", "assets")
    .parse(process.argv);

  // 옵션 파싱
  const options = program.opts();

  // 스캔 실행
  scanAssets(options.dir);

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`✅ Scanning completed in ${duration} seconds.`);
}

// --- Execution ---
try {
  await main();
} catch (error) {
  console.error("❌ An error occurred during scanning:");
  console.error(error);
  process.exit(1);
}
