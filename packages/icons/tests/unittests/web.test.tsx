import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import * as Icons from "@icons/web";

describe("Icons Web", () => {
  const iconEntries = Object.entries(Icons).filter(
    ([, value]) => typeof value === "function",
  ) as Array<[string, React.ComponentType<{ size?: number; color?: string }>]>;

  for (const [name, IconComponent] of iconEntries) {
    it(`should render ${name} icon correctly with custom props`, () => {
      const testSize = 48;
      const testColor = "red";
      const { container } = render(
        <IconComponent size={testSize} color={testColor} />,
      );
      const icon = container.querySelector("svg");

      expect(icon).toBeTruthy();
      expect(icon?.getAttribute("width")).toBe(String(testSize));
      expect(icon?.getAttribute("height")).toBe(String(testSize));
      expect(icon?.getAttribute("color")).toBe(testColor);
    });
  }
});
