import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios, { type AxiosInstance } from "axios";

import { AuthProvider } from "@/contexts/AuthProvider";
import { useAuth } from "@/contexts/useAuth";

function TestComponent() {
  const { isAuthenticated, setAuthState, clearAuthState } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">
        {isAuthenticated ? "authenticated" : "unauthenticated"}
      </span>
      <button onClick={() => setAuthState("manual-token")}>Set Token</button>
      <button onClick={() => clearAuthState()}>Clear</button>
    </div>
  );
}

describe("AuthProvider", () => {
  const instance: AxiosInstance = axios.create();
  const tokenRefreshAPICall = vi.fn();

  describe("fallback", () => {
    beforeEach(() => {
      tokenRefreshAPICall.mockResolvedValue(new Promise<string>(() => {}));
    });

    it("should show fallback while session is initializing", () => {
      render(
        <AuthProvider
          instance={instance}
          tokenRefreshAPICall={tokenRefreshAPICall}
          fallback={<div>Loading...</div>}
        >
          <TestComponent />
        </AuthProvider>,
      );

      expect(screen.getByText("Loading...")).toBeDefined();
      expect(screen.queryByTestId("auth-status")).toBeNull();
    });

    it("should show default loading div when no fallback provided", () => {
      render(
        <AuthProvider
          instance={instance}
          tokenRefreshAPICall={tokenRefreshAPICall}
        >
          <TestComponent />
        </AuthProvider>,
      );

      expect(screen.getByText("Loading...")).toBeDefined();
    });
  });

  describe("initial token refresh", () => {
    it("should provide isAuthenticated=true when token refresh succeeds", async () => {
      // This automatically triggers setAuthState inside AuthProvider
      tokenRefreshAPICall.mockResolvedValue("valid-token");

      render(
        <AuthProvider
          instance={instance}
          tokenRefreshAPICall={tokenRefreshAPICall}
        >
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("auth-status").textContent).toBe(
          "authenticated",
        );
        expect(instance.defaults.headers.common["Authorization"]).toBe(
          "Bearer valid-token",
        );
      });
    });

    it("should provide isAuthenticated=false when token refresh fails", async () => {
      tokenRefreshAPICall.mockRejectedValue(new Error("fail"));

      render(
        <AuthProvider
          instance={instance}
          tokenRefreshAPICall={tokenRefreshAPICall}
        >
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("auth-status").textContent).toBe(
          "unauthenticated",
        );
      });
    });
  });

  describe("clearAuthState", () => {
    beforeEach(() => {
      tokenRefreshAPICall.mockResolvedValue("token");
    });

    it("should clear authentication and remove Authorization header", async () => {
      render(
        <AuthProvider
          instance={instance}
          tokenRefreshAPICall={tokenRefreshAPICall}
        >
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("auth-status").textContent).toBe(
          "authenticated",
        );
      });

      fireEvent.click(screen.getByText("Clear"));

      await waitFor(() => {
        expect(screen.getByTestId("auth-status").textContent).toBe(
          "unauthenticated",
        );
        expect(
          instance.defaults.headers.common["Authorization"],
        ).toBeUndefined();
      });
    });

    it("should call onLogout callback", async () => {
      const onLogout = vi.fn();

      render(
        <AuthProvider
          instance={instance}
          tokenRefreshAPICall={tokenRefreshAPICall}
          onLogout={onLogout}
        >
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("auth-status").textContent).toBe(
          "authenticated",
        );
      });

      fireEvent.click(screen.getByText("Clear"));

      await waitFor(() => expect(onLogout).toHaveBeenCalledOnce());
    });
  });

  describe("setAuthState", () => {
    it("should update isAuthenticated and Authorization header when manually called", async () => {
      tokenRefreshAPICall.mockRejectedValue(new Error("fail"));

      render(
        <AuthProvider
          instance={instance}
          tokenRefreshAPICall={tokenRefreshAPICall}
        >
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("auth-status").textContent).toBe(
          "unauthenticated",
        );
      });

      fireEvent.click(screen.getByText("Set Token"));

      await waitFor(() => {
        expect(screen.getByTestId("auth-status").textContent).toBe(
          "authenticated",
        );
        expect(instance.defaults.headers.common["Authorization"]).toBe(
          "Bearer manual-token",
        );
      });
    });
  });
});
