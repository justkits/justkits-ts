import { logger } from "@justkits/svgs-core";

import { builder } from "./builder";

async function main() {
  logger.info("Cleaning up previous build...");

  await builder.clean();

  logger.success("✨ Clean completed.");
}

try {
  await main();
} catch (error) {
  console.error("❌ An unexpected error occurred during execution:");
  console.log(String(error));
  process.exit(1);
}
