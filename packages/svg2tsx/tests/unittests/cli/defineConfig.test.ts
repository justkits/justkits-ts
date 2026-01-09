import { describe, it, expect } from "vitest";

import { defineConfig } from "@cli/defineConfig";

describe("defineConfig", () => {
  it("should return the same config object passed to it", () => {
    const config = {
      type: "standalone" as const,
      suffix: "Icon",
      index: true,
    };

    const result = defineConfig(config);

    expect(result).toEqual(config);
    expect(result).toBe(config);
  });

  it("should work with minimal config", () => {
    const config = {
      type: "family" as const,
    };

    const result = defineConfig(config);

    expect(result).toEqual(config);
  });

  it("should work with full config", () => {
    const config = {
      type: "standalone" as const,
      suffix: "Component",
      baseDir: "/custom/path",
      index: false,
      options: {
        typescript: true,
        dimensions: false,
      },
    };

    const result = defineConfig(config);

    expect(result).toEqual(config);
    expect(result.type).toBe("standalone");
    expect(result.suffix).toBe("Component");
    expect(result.baseDir).toBe("/custom/path");
    expect(result.index).toBe(false);
    expect(result.options).toEqual({
      typescript: true,
      dimensions: false,
    });
  });

  it("should work with empty config object", () => {
    const config = {};

    const result = defineConfig(config);

    expect(result).toEqual({});
  });
});
