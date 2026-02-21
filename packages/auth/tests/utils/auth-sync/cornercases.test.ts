import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import { useSilentAuthSync, useAuthSyncRefresh } from "@/utils";

describe("BroadcastChannel unavailable", () => {
  describe("useAuthSyncRefresh", () => {
    const render = () => renderHook(() => useAuthSyncRefresh({}));

    it("should not throw when BroadcastChannel is undefined", () => {
      const original = globalThis.BroadcastChannel;
      // @ts-expect-error -- simulating missing API
      globalThis.BroadcastChannel = undefined;

      expect(() => {
        const { unmount } = render();
        unmount();
      }).not.toThrow();

      globalThis.BroadcastChannel = original;
    });

    it("should return a no-op broadcast when BroadcastChannel is undefined", () => {
      const original = globalThis.BroadcastChannel;
      // @ts-expect-error -- simulating missing API
      globalThis.BroadcastChannel = undefined;

      const { result } = render();

      expect(() => {
        result.current.broadcast("LOGIN_SUCCESS");
      }).not.toThrow();

      globalThis.BroadcastChannel = original;
    });
  });

  describe("useSilentAuthSync", () => {
    const onLoginSuccess = vi.fn();
    const render = () =>
      renderHook(() => useSilentAuthSync({ onLoginSuccess }));

    it("should not throw when BroadcastChannel is undefined", () => {
      const original = globalThis.BroadcastChannel;
      // @ts-expect-error -- simulating missing API
      globalThis.BroadcastChannel = undefined;

      expect(() => {
        const { unmount } = render();
        unmount();
      }).not.toThrow();

      globalThis.BroadcastChannel = original;
    });

    it("should return a no-op broadcast when BroadcastChannel is undefined", () => {
      const original = globalThis.BroadcastChannel;
      // @ts-expect-error -- simulating missing API
      globalThis.BroadcastChannel = undefined;

      const { result } = render();

      expect(() => {
        result.current.broadcast("LOGIN_SUCCESS");
      }).not.toThrow();

      globalThis.BroadcastChannel = original;
    });
  });
});
