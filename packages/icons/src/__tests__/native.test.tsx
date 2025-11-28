import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import * as Icons from "@icons/native";

describe("Icons Native", () => {
  const iconEntries = Object.entries(Icons).filter(
    ([, value]) => typeof value === "function",
  ) as Array<[string, React.ComponentType]>;

  for (const [name, IconComponent] of iconEntries) {
    it(`should render ${name} icon correctly`, () => {
      const { container } = render(<IconComponent />);
      const icon = container.querySelector("svg");

      expect(icon).toBeTruthy();
    });
  }
});
