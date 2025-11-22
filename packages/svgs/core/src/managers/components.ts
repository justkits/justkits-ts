import { existsSync } from "node:fs";
import { mkdir, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { compare } from "dir-compare";

import { atomicWrite } from "@lib/storage";

export type ComponentMeta = {
  componentName: string;
  relativePath: string;
};

export abstract class ComponentsBaseManager {
  protected WEB_DIR: string;
  protected NATIVE_DIR: string;

  protected allComponents: ComponentMeta[];

  protected warnings: string[];
  protected errors: string[];
  protected isScanned: boolean;

  constructor(srcDir: string) {
    this.WEB_DIR = join(srcDir, "web");
    this.NATIVE_DIR = join(srcDir, "native");

    this.allComponents = [];

    this.warnings = [];
    this.errors = [];
    this.isScanned = false;
  }

  protected abstract scanWebDirectory(): Promise<void>;

  public async scan(): Promise<void> {
    // 어차피 web과 native 디렉토리는 동일한 구조를 가져야 하므로,
    // web 디렉토리만 스캔하고, native 디렉토리는 동기화 여부만 검사
    const webExists = existsSync(this.WEB_DIR);
    const nativeExists = existsSync(this.NATIVE_DIR);

    if (!webExists && !nativeExists) {
      // Both don't exist, create them
      await mkdir(this.WEB_DIR, { recursive: true });
      await mkdir(this.NATIVE_DIR, { recursive: true });
    } else if (!webExists || !nativeExists) {
      // Only one exists, which is an error
      throw new Error(
        `Component directories are not synchronized: ${webExists ? "native/ missing" : "web/ missing"}`,
      );
    } else {
      // Both exist, verify they're synchronized
      const result = await compare(this.WEB_DIR, this.NATIVE_DIR, {
        compareContent: false,
      });

      if (!result.same) {
        throw new Error(
          "Web and Native component directories are not synchronized.",
        );
      }
    }

    await this.scanWebDirectory();
  }

  public async updateRootBarrel(): Promise<void> {
    this.assertScanned();

    const lines: string[] = [];

    for (const component of this.allComponents) {
      lines.push(
        `export { ${component.componentName} } from "./${component.relativePath}";`,
      );
    }
    lines.push('export type { IconProps } from "@icons/types";');

    const content = lines.join("\n") + "\n";

    await this.save("index.ts", content);
  }

  protected assertScanned() {
    if (!this.isScanned) {
      throw new Error("Components have not been scanned yet.");
    }
  }

  protected async save(relativePath: string, content: string): Promise<void> {
    const webPath = join(this.WEB_DIR, relativePath);
    const nativePath = join(this.NATIVE_DIR, relativePath);

    await Promise.all([
      atomicWrite(webPath, content),
      atomicWrite(nativePath, content),
    ]);
  }

  protected async collectComponents(dir: string): Promise<ComponentMeta[]> {
    const components: ComponentMeta[] = [];

    const files = await readdir(dir, { withFileTypes: true });

    for (const file of files) {
      // tsx파일이면 배열에 추가, 그렇지 않으면 warning에 추가
      if (file.isFile() && file.name.endsWith(".tsx")) {
        const componentName = file.name.replace(".tsx", "");
        const relativePath = relative(this.WEB_DIR, `${dir}/${componentName}`);

        const componentMeta: ComponentMeta = {
          componentName,
          relativePath: relativePath.replaceAll("\\", "/"),
        };

        components.push(componentMeta);
      } else {
        this.warnings.push(
          `TSX component file expected, but found: ${file.name} in directory ${dir}`,
        );
      }
    }

    return components;
  }
}
