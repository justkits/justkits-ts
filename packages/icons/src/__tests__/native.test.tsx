import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { ChevronDown } from "@icons/native";

describe("Icons Native", () => {
  it("should render ChevronDown icon", () => {
    const { container } = render(<ChevronDown />);
    const icon = container.querySelector("svg");
    expect(icon).toBeTruthy();
  });
});
