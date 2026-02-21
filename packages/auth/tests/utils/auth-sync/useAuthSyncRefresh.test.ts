import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useAuthSyncRefresh } from "@/utils/auth-sync/useAuthSyncRefresh";
import { mockChannelInstance, reloadMock } from "@tests/setup/vitest.setup";

describe("useAuthSyncRefresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("receiving messages", () => {
    it("should reload the page when LOGIN_SUCCESS is received", () => {
      renderHook(() => useAuthSyncRefresh({}));

      act(() => {
        mockChannelInstance.onmessage!({
          data: "LOGIN_SUCCESS",
        } as MessageEvent);
      });

      expect(reloadMock).toHaveBeenCalledOnce();
    });

    it("should call onLoginSuccess callback when LOGIN_SUCCESS is received", () => {
      const onLoginSuccessMock = vi.fn();
      renderHook(() =>
        useAuthSyncRefresh({
          onLoginSuccess: onLoginSuccessMock,
        }),
      );

      act(() => {
        mockChannelInstance.onmessage!({
          data: "LOGIN_SUCCESS",
        } as MessageEvent);
      });

      expect(onLoginSuccessMock).toHaveBeenCalledOnce();
    });

    it("should reload the page when LOGOUT is received", () => {
      renderHook(() => useAuthSyncRefresh({}));

      act(() => {
        mockChannelInstance.onmessage!({ data: "LOGOUT" } as MessageEvent);
      });

      expect(reloadMock).toHaveBeenCalledOnce();
    });

    it("should not reload for unknown event types", () => {
      renderHook(() => useAuthSyncRefresh({}));

      act(() => {
        mockChannelInstance.onmessage!({ data: "UNKNOWN" } as MessageEvent);
      });

      expect(reloadMock).not.toHaveBeenCalled();
    });

    it("should close the channel on unmount", () => {
      const { unmount } = renderHook(() => useAuthSyncRefresh({}));

      unmount();

      expect(mockChannelInstance.close).toHaveBeenCalledOnce();
    });
  });

  describe("broadcast function", () => {
    it("should post LOGIN_SUCCESS message to the channel", () => {
      const { result } = renderHook(() => useAuthSyncRefresh({}));

      act(() => {
        result.current.broadcast("LOGIN_SUCCESS");
      });

      expect(mockChannelInstance.postMessage).toHaveBeenCalledWith(
        "LOGIN_SUCCESS",
      );
    });

    it("should post LOGOUT message to the channel", () => {
      const { result } = renderHook(() => useAuthSyncRefresh({}));

      act(() => {
        result.current.broadcast("LOGOUT");
      });

      expect(mockChannelInstance.postMessage).toHaveBeenCalledWith("LOGOUT");
    });
  });
});
