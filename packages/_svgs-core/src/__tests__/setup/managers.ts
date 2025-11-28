import { AssetsBaseManager, AssetsMeta } from "@managers/assets";
import { ComponentsBaseManager, ComponentMeta } from "@managers/components";
import { SVGMetadata } from "@managers/database";

// ========================================== //
// ========== Assets Manager Setup ========== //
// ========================================== //

export interface TestAssetsMeta extends AssetsMeta {
  extra?: string;
}

export class TestAssetsManager extends AssetsBaseManager<TestAssetsMeta> {
  async scan(): Promise<AssetsMeta[]> {
    this.isScanned = true;
    return this.svgs;
  }

  // Expose protected methods for testing
  public testAnalyzeIconFile(filePath: string) {
    return this.analyzeIconFile(filePath);
  }

  public testPrintSummary() {
    return this.printSummary();
  }

  public testAssertScanned() {
    return this.assertScanned();
  }

  // Expose protected fields for testing
  public getSvgs() {
    return this.svgs;
  }

  public setSvgs(svgs: AssetsMeta[]) {
    this.svgs = svgs;
  }

  public getWarnings() {
    return this.warnings;
  }

  public setWarnings(warnings: string[]) {
    this.warnings = warnings;
  }

  public getErrors() {
    return this.errors;
  }

  public setErrors(errors: string[]) {
    this.errors = errors;
  }
}

// ========================================== //
// ======== Components Manager Setup ======== //
// ========================================== //

export class TestComponentsManager extends ComponentsBaseManager {
  protected async scanWebDirectory(): Promise<void> {
    this.isScanned = true;
  }

  // Expose protected methods for testing
  public testAssertScanned() {
    return this.assertScanned();
  }

  public testSave(relativePath: string, content: string) {
    return this.save(relativePath, content);
  }

  public testCollectComponents(dir: string) {
    return this.collectComponents(dir);
  }

  // Expose protected fields for testing
  public getAllComponents() {
    return this.allComponents;
  }

  public setAllComponents(components: ComponentMeta[]) {
    this.allComponents = components;
  }

  public setScanned(value: boolean) {
    this.isScanned = value;
  }

  public getWebDir() {
    return this.WEB_DIR;
  }

  public getNativeDir() {
    return this.NATIVE_DIR;
  }
}

// ========================================== //
// ========= Database Manager Setup ========= //
// ========================================== //

export interface TestSVGMetadata extends SVGMetadata {
  extra?: string;
}
