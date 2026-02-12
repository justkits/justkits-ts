import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import axios, {
  AxiosError,
  AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  useAutoRefresh,
  type AutoRefreshConfig,
  DEFAULT_AUTO_REFRESH_CONFIG,
} from "@/utils";

function make401(
  url: string,
): AxiosError & { config: InternalAxiosRequestConfig } {
  const config = {
    url,
    headers: {},
  } as InternalAxiosRequestConfig;
  const error = new AxiosError(
    "Unauthorized",
    "ERR_BAD_REQUEST",
    config,
    null,
    {
      status: 401,
      statusText: "Unauthorized",
      data: {},
      headers: {},
      config,
    },
  );
  return error as AxiosError & { config: InternalAxiosRequestConfig };
}

describe("edge cases", () => {
  let instance: AxiosInstance;
  const tokenRefreshFn = vi.fn();
  let config: AutoRefreshConfig;

  beforeEach(() => {
    instance = axios.create();
    tokenRefreshFn.mockReset().mockResolvedValue("new-token");
    config = DEFAULT_AUTO_REFRESH_CONFIG;
  });

  describe("promise deduplication", () => {
    it("should deduplicate concurrent refresh calls", async () => {
      let resolveRefresh!: (token: string) => void;
      tokenRefreshFn.mockReturnValue(
        new Promise<string>((r) => {
          resolveRefresh = r;
        }),
      );

      const error401a = make401("/api/a");
      const error401b = make401("/api/b");

      const mockAdapter = vi
        .fn()
        .mockRejectedValueOnce(error401a)
        .mockRejectedValueOnce(error401b)
        .mockResolvedValue({
          status: 200,
          statusText: "OK",
          data: "ok",
          headers: {},
          config: {},
        });

      instance.defaults.adapter = mockAdapter;
      renderHook(() => useAutoRefresh(instance, tokenRefreshFn, config));

      // Fire two requests that will both 401
      const promise1 = instance.get("/api/a");
      const promise2 = instance.get("/api/b");

      // Resolve the single refresh
      resolveRefresh("shared-token");

      await Promise.all([promise1, promise2]);

      // Only one refresh call despite two 401s
      expect(tokenRefreshFn).toHaveBeenCalledOnce();
    });

    it("should allow a new refresh after the previous one completes", async () => {
      tokenRefreshFn
        .mockResolvedValueOnce("token-1")
        .mockResolvedValueOnce("token-2");

      const mockAdapter = vi
        .fn()
        .mockRejectedValueOnce(make401("/api/a"))
        .mockResolvedValueOnce({
          status: 200,
          data: "ok-1",
          headers: {},
          config: {},
        })
        .mockRejectedValueOnce(make401("/api/b"))
        .mockResolvedValueOnce({
          status: 200,
          data: "ok-2",
          headers: {},
          config: {},
        });

      instance.defaults.adapter = mockAdapter;
      renderHook(() => useAutoRefresh(instance, tokenRefreshFn, config));

      await instance.get("/api/a");
      await instance.get("/api/b");

      expect(tokenRefreshFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("config ref updates", () => {
    it("should use the latest config without re-installing the interceptor", async () => {
      const neverRefreshConfig: AutoRefreshConfig = {
        shouldRefresh: () => false,
      };

      const { rerender } = renderHook(
        ({ cfg }) => useAutoRefresh(instance, tokenRefreshFn, cfg),
        { initialProps: { cfg: neverRefreshConfig } },
      );

      // Update to default config (refreshes on 401)
      rerender({ cfg: DEFAULT_AUTO_REFRESH_CONFIG });

      const mockAdapter = vi
        .fn()
        .mockRejectedValueOnce(make401("/api/data"))
        .mockResolvedValueOnce({
          status: 200,
          data: "ok",
          headers: {},
          config: {},
        });

      instance.defaults.adapter = mockAdapter;

      await instance.get("/api/data");

      // Should use the updated config and attempt refresh
      expect(tokenRefreshFn).toHaveBeenCalledOnce();
    });
  });
});
