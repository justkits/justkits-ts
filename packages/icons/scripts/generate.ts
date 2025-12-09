import { logger } from "@justkits/svgs-core";

import { builder } from "./builder";

async function main() {
  logger.info("🚀 [Build Started] @justkits/icons");

  await builder.generate();
}

// ============================================= //
// ================= EXECUTION ================= //
// ============================================= //

try {
  await main();
} catch (error) {
  logger.error("❌ An unexpected error occurred during execution:");
  logger.error(String(error));
  process.exit(1);
}
