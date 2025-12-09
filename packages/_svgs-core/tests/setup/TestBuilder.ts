import { vi, type Mock } from "vitest";

import { BaseSvgBuilder } from "@/builder";

export class TestBuilder extends BaseSvgBuilder {
  public saveComponentFileSpy: Mock = vi.fn();
  public generateBarrelFilesSpy: Mock = vi.fn();
  public printSummarySpy: Mock = vi.fn();

  protected async saveComponentFile(
    webCode: string,
    nativeCode: string,
    componentName: string,
    file: string,
  ): Promise<void> {
    this.saveComponentFileSpy(webCode, nativeCode, componentName, file);
  }

  protected async generateBarrelFiles(): Promise<void> {
    this.generateBarrelFilesSpy();
  }

  protected printSummary(): void {
    this.printSummarySpy();
  }

  public async testAtomicWrite(
    filePath: string,
    content: string,
  ): Promise<void> {
    await this.atomicWrite(filePath, content);
  }
}
