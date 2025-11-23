import { changesDetector } from "./core/changes";
import { iconConverter } from "./core/converter";
import { assetsManager } from "./lib/assets";
import { componentsManager } from "./lib/components";
import { databaseManager } from "./lib/database";

async function main() {
  // Phase 1) Scan and detect changes
  const scannedAssets = await assetsManager.scan();
  await databaseManager.load();

  const { toConvert, toDelete } = changesDetector.run(scannedAssets);

  // Phase 2) Convert and delete icons
  await iconConverter.runConvert(toConvert);
  await iconConverter.runDelete(toDelete);

  await databaseManager.save();

  // Phase 3) Update barrels
  await componentsManager.scan();
  await componentsManager.updateAllBarrels();

  console.log("✅ Icon generation process completed successfully.");
  // Phase 4) Check for warnings and errors
  // TODO:
}

// ============================================= //
// ================= EXECUTION ================= //
// ============================================= //

try {
  await main();
} catch (error) {
  console.error("❌ An unexpected error occurred during execution:");
  console.log(String(error));
  process.exit(1);
}
