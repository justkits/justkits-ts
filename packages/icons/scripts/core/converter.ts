/* eslint-disable @typescript-eslint/no-explicit-any */
import { unlink } from "node:fs/promises";
import { atomicWrite, BaseConverter } from "@justkits/svgs-core";

import { PATHS } from "@scripts/config";
import { databaseManager, IconMetadata } from "@scripts/lib/database";

class IconConverter extends BaseConverter<IconMetadata> {
  private componentTemplate(variables: any, { tpl }: any): any {
    return tpl`
    ${variables.imports}
    import type { IconProps } from "@icons/types";

    export function ${variables.componentName}({ size = 24, color = "#000" }: Readonly<IconProps>) {
      return (${variables.jsx});
    }
  `;
  }

  protected async convertOne(metadata: IconMetadata): Promise<void> {
    const webFilePath = `${this.srcPath}/web/${metadata.family}/components/${metadata.componentName}.tsx`;
    const nativeFilePath = `${this.srcPath}/native/${metadata.family}/components/${metadata.componentName}.tsx`;

    const webCode = await this.svg2tsx(metadata.componentName, metadata.path, {
      ...this.defaultOptions,
      template: this.componentTemplate,
    });
    const nativeCode = await this.svg2tsx(
      metadata.componentName,
      metadata.path,
      {
        ...this.defaultOptions,
        template: this.componentTemplate,
        native: true,
        svgoConfig: {
          plugins: [
            {
              name: "preset-default",
              params: { overrides: { removeViewBox: false } },
            },
            "removeXMLNS",
          ],
        },
      },
    );

    await atomicWrite(webFilePath, webCode);
    await atomicWrite(nativeFilePath, nativeCode);

    databaseManager.upsert(metadata);
  }

  protected async deleteOne(metadata: IconMetadata): Promise<void> {
    const webFilePath = `${this.srcPath}/web/${metadata.family}/components/${metadata.componentName}.tsx`;
    const nativeFilePath = `${this.srcPath}/native/${metadata.family}/components/${metadata.componentName}.tsx`;

    await unlink(webFilePath);
    await unlink(nativeFilePath);

    databaseManager.delete(metadata.iconName);
  }
}

export const iconConverter = new IconConverter(PATHS.ASSETS, PATHS.SRC);
