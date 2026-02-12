import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useSessionInit } from "@/utils/initialize-session/useSessionInit";

describe("useSessionInit", () => {
  it("should return isReady=false before token refresh completes", () => {
    const tokenRefreshFn = vi.fn(
      () => new Promise<string>(() => {}), // never resolves
    );
    const setAuthState = vi.fn();

    const { result } = renderHook(() =>
      useSessionInit({ tokenRefreshFn, setAuthState }),
    );

    expect(result.current.isReady).toBe(false);
  });

  it("should call tokenRefreshFn successfully on mount", async () => {
    const tokenRefreshFn = vi.fn().mockResolvedValue("access-token");
    const setAuthState = vi.fn();

    const { result } = renderHook(() =>
      useSessionInit({ tokenRefreshFn, setAuthState }),
    );

    await waitFor(() => {
      expect(tokenRefreshFn).toHaveBeenCalledOnce();
      expect(setAuthState).toHaveBeenCalledWith("access-token");
      expect(result.current.isReady).toBe(true);
    });
  });

  it("should only call tokenRefreshFn once even on re-render", async () => {
    const tokenRefreshFn = vi.fn().mockResolvedValue("token");
    const setAuthState = vi.fn();

    const { rerender } = renderHook(() =>
      useSessionInit({ tokenRefreshFn, setAuthState }),
    );

    rerender();
    rerender();

    await waitFor(() => {
      expect(tokenRefreshFn).toHaveBeenCalledOnce();
    });
  });

  it("should only call tokenRefreshFn once even when dependencies change", async () => {
    const tokenRefreshFn1 = vi.fn().mockResolvedValue("token");
    const setAuthState1 = vi.fn();

    const { rerender } = renderHook((props) => useSessionInit(props), {
      initialProps: {
        tokenRefreshFn: tokenRefreshFn1,
        setAuthState: setAuthState1,
      },
    });

    await waitFor(() => {
      expect(tokenRefreshFn1).toHaveBeenCalledOnce();
    });

    const tokenRefreshFn2 = vi.fn().mockResolvedValue("token-2");
    const setAuthState2 = vi.fn();

    rerender({ tokenRefreshFn: tokenRefreshFn2, setAuthState: setAuthState2 });

    await waitFor(() => {
      expect(tokenRefreshFn1).toHaveBeenCalledOnce();
    });
    expect(tokenRefreshFn2).not.toHaveBeenCalled();
  });

  it("should set isReady=true even when tokenRefreshFn rejects", async () => {
    const tokenRefreshFn = vi
      .fn()
      .mockRejectedValue(new Error("network error"));
    const setAuthState = vi.fn();

    const { result } = renderHook(() =>
      useSessionInit({ tokenRefreshFn, setAuthState }),
    );

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
    expect(setAuthState).not.toHaveBeenCalled();
  });
});
