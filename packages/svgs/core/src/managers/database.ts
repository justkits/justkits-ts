import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

import { logger } from "@lib/logger";
import { atomicWrite } from "@lib/storage";

export interface SVGMetadata {
  path: string; // svg 파일 경로
  hash: string;
  componentName: string;
  iconName: string;
}

type SVGTable<T extends SVGMetadata> = Map<string, T>; // json 파일에 저장된/저장할 테이블 (아이콘 이름 -> 아이콘 메타데이터)

/**
 * 아이콘 데이터베이스의 기본 매니저 클래스
 *  - 간단한 json 파일 기반 데이터베이스 매니저 구현을 위한 베이스 클래스
 *  - T: 아이콘 파일 하나에 대한 메타데이터 타입
 */
export class SVGDatabaseManager<T extends SVGMetadata> {
  private readonly FILE_PATH: string;

  protected iconsTable: SVGTable<T>;
  private hashTable: Map<string, string>; // 아이콘 해시 -> 아이콘 이름 테이블 (런타임에서만 사용)

  private isLoaded: boolean;
  private isSaving: boolean;
  private saveNeeded: boolean;

  constructor(filePath: string) {
    this.FILE_PATH = filePath;

    this.iconsTable = new Map();
    this.hashTable = new Map();

    this.isLoaded = false;
    this.isSaving = false;
    this.saveNeeded = false;
  }

  // ===================================== //
  // ============ 보호 Wrapper ============ //
  // ===================================== //

  protected assertLoaded() {
    if (!this.isLoaded) {
      throw new Error(
        `Database not loaded. Call load() before performing operations.`,
      );
    }
  }

  // ===================================== //
  // ============= File I/O ============== //
  // ===================================== //

  public async load() {
    if (!existsSync(this.FILE_PATH)) {
      logger.warn(
        `IconDatabase: DB file not found at ${this.FILE_PATH}, starting fresh.`,
      );
      this.iconsTable = new Map();
      this.hashTable = new Map();
      this.isLoaded = true;
      return;
    }

    try {
      const rawData = await readFile(this.FILE_PATH, "utf-8");
      const data = JSON.parse(rawData) as [string, T][];
      const icons = new Map<string, T>(data);

      const hashes = new Map<string, string>();
      for (const [name, meta] of icons) {
        hashes.set(meta.hash, name);
      }

      this.iconsTable = icons;
      this.hashTable = hashes;
      this.isLoaded = true;
    } catch (e) {
      logger.error(
        `Failed to parse JSON file at ${this.FILE_PATH}. It might be corrupted.`,
      );
      if (e instanceof Error) {
        logger.error(e.message);
      }
    }
  }

  public async save(): Promise<void> {
    this.assertLoaded();

    if (this.isSaving) return;

    if (!this.saveNeeded) {
      logger.info("No changes to save.");
      return;
    }

    this.isSaving = true;

    try {
      const data = Array.from(this.iconsTable.entries());
      await atomicWrite(this.FILE_PATH, JSON.stringify(data, null, 2));

      logger.info(`Database saved to ${this.FILE_PATH} successfully.`);
      this.saveNeeded = false;
    } catch (e) {
      logger.error(`Failed to save database to ${this.FILE_PATH}.`);

      if (e instanceof Error) {
        logger.error(e.message);
      }
    } finally {
      this.isSaving = false;
    }
  }

  // ===================================== //
  // ============ Query APIs ============= //
  // ===================================== //

  public get(iconName: string): T | null {
    this.assertLoaded();
    return this.iconsTable.get(iconName) ?? null;
  }

  public getAll(): T[] {
    this.assertLoaded();
    return Array.from(this.iconsTable.values());
  }

  // ===================================== //
  // =========== Mutation APIs =========== //
  // ===================================== //

  public upsert(meta: T): void {
    this.assertLoaded();

    const existingIcon = this.iconsTable.get(meta.iconName);

    if (!existingIcon) {
      // NEW
      logger.info(`IconTable: Adding new icon '${meta.iconName}'`);
    } else if (existingIcon.hash !== meta.hash) {
      // UPDATED
      logger.info(`IconTable: Updating icon '${meta.iconName}'`);

      this.hashTable.delete(existingIcon.hash);
    }

    this.iconsTable.set(meta.iconName, { ...meta });
    this.hashTable.set(meta.hash, meta.iconName);
    this.saveNeeded = true;
  }

  public delete(iconName: string): void {
    this.assertLoaded();

    const existingIcon = this.iconsTable.get(iconName);
    if (existingIcon) {
      logger.info(`IconTable: Deleting icon '${iconName}'`);
      this.iconsTable.delete(iconName);
      this.hashTable.delete(existingIcon.hash);
      this.saveNeeded = true;
    }
  }
}
