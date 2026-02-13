import { useMemo } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { ProtectedRoute } from "@/contexts/ProtectedRoute";
import { AuthContext } from "@/contexts/useAuth";

function TestProvider({
  isAuthenticated = false,
  children,
}: Readonly<{ isAuthenticated?: boolean; children: React.ReactNode }>) {
  const value = useMemo(
    () => ({
      isAuthenticated,
      setAuthState: vi.fn(),
      clearAuthState: vi.fn(),
      broadcast: vi.fn(),
    }),
    [isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

describe("ProtectedRoute", () => {
  describe("when authenticated", () => {
    it("should render children", () => {
      render(
        <TestProvider isAuthenticated={true}>
          <ProtectedRoute fallback={<div>Login</div>}>
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestProvider>,
      );

      expect(screen.getByText("Protected Content")).toBeDefined();
      expect(screen.queryByText("Login")).toBeNull();
    });

    it("should not call onUnauthorized", () => {
      const onUnauthorized = vi.fn();

      render(
        <TestProvider isAuthenticated>
          <ProtectedRoute onUnauthorized={onUnauthorized}>
            <div>Content</div>
          </ProtectedRoute>
        </TestProvider>,
      );

      expect(onUnauthorized).not.toHaveBeenCalled();
    });
  });

  describe("when not authenticated", () => {
    it("should render fallback", () => {
      render(
        <TestProvider>
          <ProtectedRoute fallback={<div>Please Login</div>}>
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestProvider>,
      );

      expect(screen.getByText("Please Login")).toBeDefined();
      expect(screen.queryByText("Protected Content")).toBeNull();
    });

    it("should call onUnauthorized", () => {
      const onUnauthorized = vi.fn();

      render(
        <TestProvider>
          <ProtectedRoute
            onUnauthorized={onUnauthorized}
            fallback={<div>Fallback</div>}
          >
            <div>Content</div>
          </ProtectedRoute>
        </TestProvider>,
      );

      expect(onUnauthorized).toHaveBeenCalledOnce();
    });

    it("should render empty when only onUnauthorized is provided", () => {
      const onUnauthorized = vi.fn();

      const { container } = render(
        <TestProvider>
          <ProtectedRoute onUnauthorized={onUnauthorized}>
            <div>Content</div>
          </ProtectedRoute>
        </TestProvider>,
      );

      expect(screen.queryByText("Content")).toBeNull();
      // Renders an empty fragment (no fallback provided)
      expect(container.innerHTML).toBe("");
    });
  });

  describe("auth state transition", () => {
    it("should switch from fallback to children when auth state changes", () => {
      const { rerender } = render(
        <TestProvider>
          <ProtectedRoute fallback={<div>Login</div>}>
            <div>Protected</div>
          </ProtectedRoute>
        </TestProvider>,
      );

      expect(screen.getByText("Login")).toBeDefined();
      expect(screen.queryByText("Protected")).toBeNull();

      rerender(
        <TestProvider isAuthenticated>
          <ProtectedRoute fallback={<div>Login</div>}>
            <div>Protected</div>
          </ProtectedRoute>
        </TestProvider>,
      );

      expect(screen.getByText("Protected")).toBeDefined();
      expect(screen.queryByText("Login")).toBeNull();
    });
  });
});
