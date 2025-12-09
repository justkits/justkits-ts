import { basename, dirname, join, relative } from "node:path";
import { Config } from "@svgr/core";
import jsxPlugin from "@svgr/plugin-jsx";
import svgoPlugin from "@svgr/plugin-svgo";
import { BaseSvgBuilder, Options, logger } from "@justkits/svgs-core";

class IconsBuilder extends BaseSvgBuilder {
  private readonly exportMap: Record<string, string[]>; // key: familyName, value: componentNames[]

  constructor(options: Options) {
    super(options, __dirname);
    this.exportMap = {};
  }

  protected printSummary(): void {
    const summaryData = Object.keys(this.exportMap)
      .sort((a, b) => a.localeCompare(b))
      .map((familyName) => ({
        Family: familyName,
        Count: this.exportMap[familyName].length,
        Status: "✅ OK",
      }));

    logger.detail("📊 Conversion Summary:");
    console.table(summaryData);
  }

  protected async saveComponentFile(
    webCode: string,
    nativeCode: string,
    componentName: string,
    file: string,
  ): Promise<void> {
    const familyName = relative(this.ASSETS_DIR, dirname(file));

    if (!familyName || familyName === ".") {
      throw new Error(
        `Icon "${basename(file)}" must be placed inside a category folder (e.g., assets/media/${basename(file)}).`,
      );
    }

    await this.atomicWrite(
      join(this.SRC_DIR, "web", familyName, `components/${componentName}.tsx`),
      webCode,
    );
    await this.atomicWrite(
      join(
        this.SRC_DIR,
        "native",
        familyName,
        `components/${componentName}.tsx`,
      ),
      nativeCode,
    );
    if (!this.exportMap[familyName]) {
      this.exportMap[familyName] = [];
    }
    this.exportMap[familyName].push(componentName);
    logger.success(`Generated: ${familyName}/${componentName}`);
  }

  protected async generateBarrelFiles(): Promise<void> {
    logger.info("\nGenerating barrel files...");

    const rootBarrelLines: string[] = [];

    for (const familyName of Object.keys(this.exportMap)) {
      const componentNames = this.exportMap[familyName];
      const familyBarrelLines: string[] = [];

      for (const componentName of componentNames) {
        familyBarrelLines.push(
          `export { ${componentName} } from "./components/${componentName}";`,
        );
      }
      rootBarrelLines.push(
        `export { ${componentNames.join(", ")} } from "./${familyName}";`,
      );
      const familyBarrelContent = familyBarrelLines.join("\n") + "\n";

      await this.atomicWrite(
        join(this.SRC_DIR, "web", familyName, "index.ts"),
        familyBarrelContent,
      );
      await this.atomicWrite(
        join(this.SRC_DIR, "native", familyName, "index.ts"),
        familyBarrelContent,
      );
    }

    const rootBarrelContent = rootBarrelLines.join("\n") + "\n";
    await this.atomicWrite(
      join(this.SRC_DIR, "web", "index.ts"),
      rootBarrelContent,
    );
    await this.atomicWrite(
      join(this.SRC_DIR, "native", "index.ts"),
      rootBarrelContent,
    );

    logger.success("Barrel files generated successfully.\n");
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function template(variables: any, { tpl }: any) {
  return tpl`
    ${variables.imports}
    import type { IconProps } from "@icons/types";

    export function ${variables.componentName}({ size = 24, color = "#000" }: Readonly<IconProps>) {
      return (${variables.jsx});
    }
  `;
}

const defaultOptions: Config = {
  icon: true,
  typescript: true,
  prettier: true,
  jsxRuntime: "automatic",
  expandProps: false,
  plugins: [svgoPlugin, jsxPlugin],
  svgProps: {
    width: "{size}",
    height: "{size}",
    color: "{color}",
  },
  template,
};

const options: Options = {
  WEB: {
    ...defaultOptions,
    svgoConfig: {
      plugins: [
        {
          name: "preset-default",
          params: { overrides: { removeViewBox: false } },
        },
        {
          name: "convertColors",
          params: { currentColor: true },
        },
        "prefixIds",
        "removeDimensions",
      ],
    },
  },
  NATIVE: {
    ...defaultOptions,
    native: true,
    svgoConfig: {
      plugins: [
        {
          name: "preset-default",
          params: { overrides: { removeViewBox: false } },
        },
        {
          name: "convertColors",
          params: { currentColor: true },
        },
        "removeXMLNS",
        "prefixIds",
        "removeDimensions",
      ],
    },
  },
};

export const builder = new IconsBuilder(options);
