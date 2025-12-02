import fs from "node:fs";
import path from "node:path";

import { allContent, baseContent, reactContent } from "./content";

interface InitOptions {
  react?: boolean;
  all?: boolean;
  force?: boolean;
}

export function initAction(options: InitOptions): void {
  const targetFile = path.resolve(process.cwd(), "eslint.config.ts");

  if (fs.existsSync(targetFile)) {
    if (options.force) {
      fs.unlinkSync(targetFile);
      console.log(`Deleted existing ${targetFile}`);
    } else {
      console.error(`Error: ${targetFile} already exists.`);
      process.exit(1);
    }
  }

  let content = "";

  if (options.all) {
    content = allContent;
  } else if (options.react) {
    content = reactContent;
  } else {
    content = baseContent;
  }

  try {
    fs.writeFileSync(targetFile, content);
    console.log("Successfully created eslint.config.ts");
  } catch (error) {
    console.error("Failed to create configuration file:", error);
    process.exit(1);
  }
}
