import { SVGDatabaseManager, type SVGMetadata } from "@justkits/svgs-core";

import { PATHS } from "@scripts/config";

export type IconMetadata = SVGMetadata & {
  family: string;
};

export const databaseManager = new SVGDatabaseManager<IconMetadata>(
  PATHS.DATABASE,
);
