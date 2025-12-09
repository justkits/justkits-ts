import { describe, expect, it } from "vitest";

import { BaseSvgBuilder, logger } from "@/index";

describe("index", () => {
  it("should export BaseSvgBuilder", () => {
    expect(BaseSvgBuilder).toBeDefined();
  });

  it("should export logger", () => {
    expect(logger).toBeDefined();
  });
});
