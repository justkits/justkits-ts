import { renderHook } from "@testing-library/react";

import { useAuth, useUser } from "@/index";

describe("contexts corner cases", () => {
  it("should throw error when useAuth is used outside of AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });

  it("should throw error when useUser is used outside of UserProvider", () => {
    expect(() => renderHook(() => useUser())).toThrow(
      "useUser must be used within a UserProvider",
    );
  });
});
