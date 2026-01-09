import { basename, dirname, join, relative } from "node:path";
import { Config } from "@svgr/core";

import { BaseSvgBuilder } from "./base";
import { logger } from "@lib/logger";
import { atomicWrite } from "@lib/atomicWrite";

/**
 * SVG -> React 컴포넌트 변환용 빌더 (Family 분류를 포함)
 *
 * assets/[family]/[icon-name].svg 구조의 SVG 파일을
 * src/[family]/components/[ComponentName].tsx 형태로 변환.
 */
export class FamilySvgBuilder extends BaseSvgBuilder {
  private readonly exportMap: Record<string, string[]>; // key: familyName, value: componentNames[]

  /**
   * FamilySvgBuilder 초기화
   *
   * @param options - SVGR 변환 설정 객체
   * @param baseDir - 패키지 루트 디렉토리
   * @param suffix - 컴포넌트 이름 뒤에 붙일 접미사 (기본값: "")
   * @param generateIndex - index.ts 파일 생성 여부 (기본값: false)
   */
  constructor(
    options: Config,
    baseDir: string,
    suffix: string = "",
    generateIndex: boolean = false,
  ) {
    super(options, baseDir, suffix, generateIndex);
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

  protected async generateBarrelFiles(): Promise<void> {
    const rootBarrelLines: string[] = [];
    const sortedFamilyNames = Object.keys(this.exportMap).sort((a, b) =>
      a.localeCompare(b),
    );

    for (const familyName of sortedFamilyNames) {
      const componentNames = this.exportMap[familyName];
      componentNames.sort((a, b) => a.localeCompare(b));
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

      await atomicWrite(
        join(this.SRC_DIR, familyName, "index.ts"),
        familyBarrelContent,
      );
    }

    const rootBarrelContent = rootBarrelLines.join("\n") + "\n";
    await atomicWrite(join(this.SRC_DIR, "index.ts"), rootBarrelContent);
  }

  protected async saveComponentFile(
    content: string,
    componentName: string,
    file: string,
  ): Promise<void> {
    const familyName = relative(this.ASSETS_DIR, dirname(file));

    if (!familyName || familyName === ".") {
      throw new Error(
        `Icon "${basename(file)}" must be placed inside a category folder (e.g., assets/media/${basename(file)}).`,
      );
    }

    await atomicWrite(
      join(this.SRC_DIR, familyName, `components/${componentName}.tsx`),
      content,
    );
    if (!this.exportMap[familyName]) {
      this.exportMap[familyName] = [];
    }
    this.exportMap[familyName].push(componentName);
    logger.info(`Generated: ${familyName}/${componentName}`);
  }
}
