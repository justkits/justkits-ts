import { describe, it, expect } from "vitest";

import { kebabToPascal } from "@lib/kebabToPascal";

describe("Kebab-case validation", () => {
  it("should accept valid kebab-case filenames", async () => {
    // 기본
    const result1 = kebabToPascal("my-icon", "");
    expect(result1).toBe("MyIcon");

    // 기본 + 접미사
    const resultWithSuffix = kebabToPascal("user-profile", "Icon");
    expect(resultWithSuffix).toBe("UserProfileIcon");

    // 한 단어
    const resultSingle = kebabToPascal("example", "");
    expect(resultSingle).toBe("Example");

    // 한 단어 + 접미사
    const resultSingleWithSuffix = kebabToPascal("example", "Svg");
    expect(resultSingleWithSuffix).toBe("ExampleSvg");
  });

  it("should reject filename with uppercase letters", async () => {
    expect(() => kebabToPascal("MyIcon", "")).toThrow("MyIcon");
  });

  it("should reject filename with underscores", async () => {
    expect(() => kebabToPascal("icon_name", "")).toThrow("icon_name");
  });

  it("should reject filename starting with number", async () => {
    expect(() => kebabToPascal("123-icon", "")).toThrow("123-icon");
  });

  it("should reject filename containing numbers", async () => {
    expect(() => kebabToPascal("icon2-name", "")).toThrow("icon2-name");
  });

  it("should reject filename with numbers in middle", async () => {
    expect(() => kebabToPascal("icon-2-name", "")).toThrow("icon-2-name");
  });

  it("should reject filename starting with dash", async () => {
    expect(() => kebabToPascal("-icon", "")).toThrow("-icon");
  });

  it("should reject filename ending with dash", async () => {
    expect(() => kebabToPascal("icon-", "")).toThrow("icon-");
  });

  it("should reject filename with double dashes", async () => {
    expect(() => kebabToPascal("icon--name", "")).toThrow("icon--name");
  });
});
