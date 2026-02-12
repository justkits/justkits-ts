import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useSilentAuthSync } from "@/utils/auth-sync/useSilentAuthSync";
import { mockChannelInstance, reloadMock } from "@tests/setup/vitest.setup";

describe("useSilentAuthSync", () => {
  const onLoginSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("receiving messages", () => {
    it("should call onLoginSuccess when LOGIN_SUCCESS is received", async () => {
      renderHook(() => useSilentAuthSync({ onLoginSuccess }));

      await act(async () => {
        mockChannelInstance.onmessage!({
          data: "LOGIN_SUCCESS",
        } as MessageEvent);
      });

      expect(onLoginSuccess).toHaveBeenCalledOnce();
      expect(reloadMock).not.toHaveBeenCalled();
    });

    it("should reload the page when LOGOUT is received", () => {
      renderHook(() => useSilentAuthSync({ onLoginSuccess }));

      act(() => {
        mockChannelInstance.onmessage!({ data: "LOGOUT" } as MessageEvent);
      });

      expect(reloadMock).toHaveBeenCalledOnce();
      expect(onLoginSuccess).not.toHaveBeenCalled();
    });

    it("should not reload or call onLoginSuccess for unknown event types", () => {
      renderHook(() => useSilentAuthSync({ onLoginSuccess }));

      act(() => {
        mockChannelInstance.onmessage!({ data: "UNKNOWN" } as MessageEvent);
      });

      expect(reloadMock).not.toHaveBeenCalled();
      expect(onLoginSuccess).not.toHaveBeenCalled();
    });

    it("should await an async onLoginSuccess callback", async () => {
      const asyncCallback = vi.fn(
        () => new Promise<void>((resolve) => setTimeout(resolve, 0)),
      );

      renderHook(() => useSilentAuthSync({ onLoginSuccess: asyncCallback }));

      await act(async () => {
        mockChannelInstance.onmessage!({
          data: "LOGIN_SUCCESS",
        } as MessageEvent);
      });

      expect(asyncCallback).toHaveBeenCalledOnce();
    });

    it("should use the latest onLoginSuccess callback", async () => {
      const firstCallback = vi.fn();
      const secondCallback = vi.fn();

      const { rerender } = renderHook(
        ({ cb }) => useSilentAuthSync({ onLoginSuccess: cb }),
        { initialProps: { cb: firstCallback } },
      );

      rerender({ cb: secondCallback });

      await act(async () => {
        mockChannelInstance.onmessage!({
          data: "LOGIN_SUCCESS",
        } as MessageEvent);
      });

      expect(firstCallback).not.toHaveBeenCalled();
      expect(secondCallback).toHaveBeenCalledOnce();
    });

    it("should close the channel on unmount", () => {
      const { unmount } = renderHook(() =>
        useSilentAuthSync({ onLoginSuccess }),
      );

      unmount();

      expect(mockChannelInstance.close).toHaveBeenCalledOnce();
    });
  });

  describe("broadcast function", () => {
    it("should post LOGIN_SUCCESS message to the channel", () => {
      const { result } = renderHook(() =>
        useSilentAuthSync({ onLoginSuccess }),
      );

      act(() => {
        result.current.broadcast("LOGIN_SUCCESS");
      });

      expect(mockChannelInstance.postMessage).toHaveBeenCalledWith(
        "LOGIN_SUCCESS",
      );
    });

    it("should post LOGOUT message to the channel", () => {
      const { result } = renderHook(() =>
        useSilentAuthSync({ onLoginSuccess }),
      );

      act(() => {
        result.current.broadcast("LOGOUT");
      });

      expect(mockChannelInstance.postMessage).toHaveBeenCalledWith("LOGOUT");
    });
  });
});
