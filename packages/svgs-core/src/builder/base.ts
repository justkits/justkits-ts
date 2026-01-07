import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { createHash } from "node:crypto";
import fg from "fast-glob";
import pLimit from "p-limit";
import { Config, transform } from "@svgr/core";

import { logger } from "@/logger";

/**
 * SVG 파일을 React 컴포넌트로 변환하는 추상 베이스 빌더 클래스
 *
 * @abstract
 */
export abstract class BaseSvgBuilder {
  protected readonly ASSETS_DIR: string;
  protected readonly SRC_DIR: string;

  protected readonly nameRegistry: Map<string, string>; // key: componentName, value: filePath (duplicate check)
  protected readonly contentRegistry: Map<string, string>; // key: contentHash, value: filePath (duplicate check)

  private readonly options: Config;
  private readonly baseDir: string;
  private readonly suffix: string;

  /**
   * 빌더 초기화
   *
   * @param options - SVGR 변환 설정 객체
   * @param baseDir - 패키지 루트 디렉토리 (assets/와 src/의 부모 경로)
   * @param suffix - 컴포넌트 이름 뒤에 붙일 접미사 (기본값: "")
   *
   * @example
   * ```typescript
   * const builder = new FamilySvgBuilder(
   *   defaultOptions,
   *   join(dirname(fileURLToPath(import.meta.url)), "..")
   * );
   * ```
   */
  constructor(options: Config, baseDir: string, suffix: string = "") {
    this.baseDir = baseDir;
    this.ASSETS_DIR = resolve(this.baseDir, "assets");
    this.SRC_DIR = resolve(this.baseDir, "src");

    this.nameRegistry = new Map();
    this.contentRegistry = new Map();

    this.options = options;
    this.suffix = suffix;
  }

  /**
   * SVG 파일을 React 컴포넌트로 변환하는 메인 메서드

   * @throws {Error} 파일명이 kebab-case가 아니거나 중복이 발견된 경우
   */
  public async generate(): Promise<void> {
    const startTime = performance.now();

    logger.detail("---------------------------------------------------\n");
    await this.clean();

    logger.success("Clean completed. Starting generation...\n");
    await this.processSvgs();

    logger.success("SVG processing completed. Generating barrel files...\n");
    await this.generateBarrelFiles();

    logger.success("Barrel files generated successfully.\n");
    this.printSummary();

    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    const count = this.nameRegistry.size;

    logger.success(
      `✨ [Success] Generated ${count} components in ${duration}s`,
    );
  }

  // ================================================== //
  // ============== Major Subprocesses ================ //
  // ================================================== //

  private async clean(): Promise<void> {
    const patterns = ["**/*.tsx", "**/index.ts"];
    const deletedPaths = await fg(patterns, {
      cwd: this.SRC_DIR,
      absolute: true,
      ignore: ["types.ts"], // Ensure types.ts is never deleted even if matched
    });

    for (const path of deletedPaths) {
      await rm(path, { force: true });
    }
  }

  private async processSvgs() {
    const svgFiles = await fg("**/*.svg", {
      cwd: this.ASSETS_DIR,
      absolute: true,
    });

    // Limit concurrency to prevent EMFILE errors and memory spikes
    const limit = pLimit(10);

    await Promise.all(
      svgFiles.map((file) =>
        limit(async () => {
          const fileName = basename(file, ".svg");

          // Kebab-case 검사: 소문자와 단일 대시만 허용, 숫자/선행/후행/이중 대시 불허
          if (!/^[a-z]+(-[a-z]+)*$/.test(fileName)) {
            throw new Error(
              `Invalid filename: "${fileName}". Filenames must be strictly kebab-case (lowercase letters and single dashes only, e.g., "my-icon").`,
            );
          }

          const svgCode = await readFile(file, "utf-8");
          const componentName = this.kebabToPascal(fileName);
          this.duplicateNameCheck(componentName, file);

          const contentHash = createHash("sha512")
            .update(svgCode)
            .digest("hex");
          this.duplicateContentCheck(contentHash, file);

          // Register new component and content
          this.nameRegistry.set(componentName, file);
          this.contentRegistry.set(contentHash, file);

          const content = await transform(svgCode, this.options, {
            componentName,
          });

          await this.saveComponentFile(content, componentName, file);
        }),
      ),
    );
  }

  // ================================================== //
  // ================ Abstract Methods ================ //
  // ================================================== //

  /**
   * 변환된 컴포넌트를 파일로 저장
   *
   * @param content - 변환된 React 컴포넌트 코드
   * @param componentName - PascalCase 컴포넌트 이름
   * @param file - 원본 SVG 파일 경로 (선택사항)
   *
   * @abstract
   */
  protected abstract saveComponentFile(
    content: string,
    componentName: string,
    file?: string,
  ): Promise<void>;

  /**
   * index.ts 배럴 파일 생성
   *
   * @abstract
   */
  protected abstract generateBarrelFiles(): Promise<void>;

  /**
   * 변환 결과 요약 출력
   *
   * @abstract
   */
  protected abstract printSummary(): void;

  // ================================================== //
  // =============== Utility Methods ================== //
  // ================================================== //

  /**
   * 파일을 원자적으로 작성 (먼저 .tmp 파일에 쓴 후 rename하여 부분적인 쓰기를 방지)
   *
   * @param filePath - 대상 파일 경로
   * @param content - 파일에 쓸 내용
   *
   * @throws {Error} 파일 쓰기 중 오류가 발생한 경우
   */
  protected async atomicWrite(
    filePath: string,
    content: string,
  ): Promise<void> {
    const tempFilePath = `${filePath}.tmp`;

    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(tempFilePath, content, "utf-8");

    try {
      await rename(tempFilePath, filePath);
    } catch (error) {
      await rm(tempFilePath, { force: true });
      throw error;
    }
  }

  private duplicateNameCheck(componentName: string, file: string): void {
    if (this.nameRegistry.has(componentName)) {
      const existingPath = this.nameRegistry.get(componentName);
      logger.error(
        `Duplicate component name detected: ${componentName}\n` +
          ` - ${existingPath}\n` +
          ` - ${file}\n` +
          `Please rename one of the files to ensure unique component names.`,
      );

      throw new Error("Duplicate component names found.");
    }
  }

  private duplicateContentCheck(contentHash: string, file: string): void {
    if (this.contentRegistry.has(contentHash)) {
      const existingPath = this.contentRegistry.get(contentHash);
      logger.error(
        `Duplicate SVG content detected:\n` +
          ` - ${existingPath}\n` +
          ` - ${file}\n` +
          `These files contain identical SVG code. Please remove one or modify the content.`,
      );
      throw new Error("Duplicate SVG content found.");
    }
  }

  protected kebabToPascal(str: string): string {
    const pascalName = str
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");

    return pascalName + this.suffix;
  }
}
