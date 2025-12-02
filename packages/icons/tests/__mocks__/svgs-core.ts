/* eslint-disable @typescript-eslint/no-unused-vars */
import { vi } from "vitest";

export type AssetsMeta = {
  path: string;
  hash: string;
  iconName: string;
};

export type ComponentMeta = {
  componentName: string;
  path: string;
};

export type SVGMetadata = {
  iconName: string;
  componentName: string;
  hash: string;
};

export const atomicWrite: ReturnType<typeof vi.fn> = vi.fn();

export class AssetsBaseManager<T = AssetsMeta> {
  protected ASSETS_DIR: string;
  protected svgs: T[] = [];
  protected errors: string[] = [];
  protected isScanned: boolean = false;

  constructor(assetsDir: string) {
    this.ASSETS_DIR = assetsDir;
  }

  protected async analyzeIconFile(
    _iconPath: string,
  ): Promise<{ hash: string; iconName: string } | null> {
    return { hash: "mocked-hash", iconName: "mocked-icon-name" };
  }

  protected printSummary() {
    // Mocked print summary
  }
}

export class ComponentsBaseManager {
  protected WEB_DIR: string;
  protected allComponents: ComponentMeta[] = [];
  protected isScanned: boolean = false;

  constructor(srcDir: string) {
    this.WEB_DIR = srcDir;
  }

  protected assertScanned() {
    if (!this.isScanned) {
      throw new Error("Not scanned");
    }
  }

  protected async collectComponents(_dir: string): Promise<ComponentMeta[]> {
    return [];
  }

  protected async save(_relativePath: string, _content: string): Promise<void> {
    // Mocked save
  }

  protected async updateRootBarrel(): Promise<void> {
    // Mocked update root barrel
  }
}

export class SVGDatabaseManager<T extends SVGMetadata> {
  protected FILE_PATH: string;
  protected iconsTable: Map<string, T> = new Map();
  protected isLoaded: boolean = false;

  constructor(filePath: string) {
    this.FILE_PATH = filePath;
  }

  public async load(): Promise<void> {
    this.isLoaded = true;
  }

  public async save(): Promise<void> {
    // Mocked save
  }

  public get(iconName: string): T | null {
    return this.iconsTable.get(iconName) ?? null;
  }

  public getAll(): T[] {
    return Array.from(this.iconsTable.values());
  }

  public upsert(meta: T): void {
    this.iconsTable.set(meta.iconName, meta);
  }

  public delete(iconName: string): void {
    this.iconsTable.delete(iconName);
  }
}

export class BaseChangesDetector<A extends AssetsMeta, M extends SVGMetadata> {
  protected iconNames: Record<string, string> = {};
  protected iconHashes: Record<string, string> = {};
  protected toConvert: M[] = [];
  protected toDelete: M[] = [];
  protected addedCount: number = 0;
  protected updatedCount: number = 0;
  protected errors: string[] = [];

  public run(svgs: A[]): { toConvert: M[]; toDelete: M[] } {
    for (const svg of svgs) {
      this.validateAsset(svg);
      this.compareHash(svg);
    }
    this.detectDeletedSVGs();

    this.printSummary();

    return {
      toConvert: this.toConvert,
      toDelete: this.toDelete,
    };
  }

  protected compareHash(_svg: A): void {
    // Mocked compare hash
  }
  protected detectDeletedSVGs(): void {
    // Mocked detect deleted SVGs
  }

  protected validateAsset(assetData: A): void {
    if (this.iconNames[assetData.iconName]) {
      const errorMsg = `[Validation Error] Duplicate name "${assetData.iconName}"`;
      this.errors.push(errorMsg);
    }

    if (this.iconHashes[assetData.hash]) {
      const errorMsg = `[Validation Error] Duplicate content:`;
      this.errors.push(errorMsg);
    }
  }

  protected kebabToPascal(str: string): string {
    return str.replaceAll(/(^\w|-\w)/g, (g) =>
      g.replaceAll("-", "").toUpperCase(),
    );
  }

  private printSummary(): void {
    if (this.errors.length > 0) {
      console.error("❌ Validation errors found:");
      for (const error of this.errors) {
        console.error(error);
      }
      throw new Error("Validation errors detected during changes detection.");
    } else {
      console.log("✅ No validation errors found.");
    }
  }
}

export abstract class BaseConverter<T extends SVGMetadata> {
  protected assetsPath: string;
  protected srcPath: string;
  protected defaultOptions: Record<string, unknown> = {};

  constructor(assetsPath: string, srcPath: string) {
    this.assetsPath = assetsPath;
    this.srcPath = srcPath;
  }

  protected abstract convertOne(metadata: T): Promise<void>;
  protected abstract deleteOne(metadata: T): Promise<void>;

  public async runConvert(toConvert: T[]): Promise<void> {
    for (const item of toConvert) {
      await this.convertOne(item);
    }
  }

  public async runDelete(toDelete: T[]): Promise<void> {
    for (const item of toDelete) {
      await this.deleteOne(item);
    }
  }

  protected async svg2tsx(
    componentName: string,
    _path: string,
    options: Record<string, unknown> & {
      template?: (
        variables: Record<string, unknown>,
        context: {
          tpl: (strings: TemplateStringsArray, ...values: unknown[]) => string;
        },
      ) => string;
    },
  ): Promise<string> {
    if (options?.template) {
      const variables = {
        imports: "// Mocked Imports",
        componentName,
        jsx: "<MockedJSX />",
      };

      const tpl = (strings: TemplateStringsArray, ...values: unknown[]) => {
        let result = "";
        for (let i = 0; i < strings.length; i++) {
          result += strings[i] + (values[i] ? String(values[i]) : "");
        }
        return result;
      };

      return options.template(variables, { tpl });
    }
    return `// Mocked component code for ${componentName}`;
  }
}
