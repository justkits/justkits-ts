import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";

import { useAuth, AuthContext } from "@/contexts/useAuth";

describe("useAuth", () => {
  it("should throw when used outside of AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });

  it("should return context value when used within AuthContext.Provider", () => {
    const mockValue = {
      isAuthenticated: true,
      setAuthState: vi.fn(),
      clearAuthState: vi.fn(),
      broadcast: vi.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthContext.Provider, { value: mockValue }, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.setAuthState).toBe(mockValue.setAuthState);
    expect(result.current.clearAuthState).toBe(mockValue.clearAuthState);
    expect(result.current.broadcast).toBe(mockValue.broadcast);
  });
});
