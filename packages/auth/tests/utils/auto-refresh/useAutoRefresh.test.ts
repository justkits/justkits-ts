import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import axios, {
  AxiosError,
  type AxiosInstance,
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

function make500(url: string): AxiosError {
  const config = { url, headers: {} } as InternalAxiosRequestConfig;
  return new AxiosError("Server Error", "ERR_BAD_RESPONSE", config, null, {
    status: 500,
    statusText: "Internal Server Error",
    data: {},
    headers: {},
    config,
  });
}

describe("useAutoRefresh", () => {
  let instance: AxiosInstance;
  const tokenRefreshFn = vi.fn();
  let config: AutoRefreshConfig;

  beforeEach(() => {
    instance = axios.create();
    tokenRefreshFn.mockReset().mockResolvedValue("new-token");
    config = DEFAULT_AUTO_REFRESH_CONFIG;
  });

  it("should call tokenRefreshFn and retry the request with the new token", async () => {
    const error401 = make401("/api/data");
    const successResponse = {
      status: 200,
      statusText: "OK",
      data: { ok: true },
      headers: {},
      config: error401.config,
    };

    const mockAdapter = vi
      .fn()
      .mockRejectedValueOnce(error401)
      .mockResolvedValueOnce(successResponse);

    instance.defaults.adapter = mockAdapter;
    renderHook(() => useAutoRefresh(instance, tokenRefreshFn, config));

    const response = await instance.get("/api/data");

    expect(tokenRefreshFn).toHaveBeenCalledOnce();
    expect(response.data).toEqual({ ok: true });

    // Verify the retry request had the new token
    const retryCall = mockAdapter.mock.calls[1][0];
    expect(retryCall.headers["Authorization"]).toBe("Bearer new-token");
    expect(retryCall._retry).toBe(true);
  });

  it("should throw original error if tokenRefreshFn fails", async () => {
    tokenRefreshFn.mockRejectedValue(new Error("refresh failed"));

    const mockAdapter = vi.fn().mockRejectedValueOnce(make401("/api/data"));
    instance.defaults.adapter = mockAdapter;
    renderHook(() => useAutoRefresh(instance, tokenRefreshFn, config));

    try {
      await instance.get("/api/data");
      expect.unreachable("should have thrown");
    } catch (error) {
      // Should throw the original 401, not the refresh error
      expect(error).toBeInstanceOf(AxiosError);
      expect((error as AxiosError).response?.status).toBe(401);
    }
  });

  describe("no-auto-refresh scenarios", () => {
    it("error.response is undefined", async () => {
      const networkError = new AxiosError("Network Error", "ERR_NETWORK", {
        url: "/api",
        headers: {},
      } as InternalAxiosRequestConfig);

      const mockAdapter = vi.fn().mockRejectedValueOnce(networkError);
      instance.defaults.adapter = mockAdapter;
      renderHook(() => useAutoRefresh(instance, tokenRefreshFn, config));

      await expect(instance.get("/api")).rejects.toThrow("Network Error");
      expect(tokenRefreshFn).not.toHaveBeenCalled();
    });

    it("error.config is undefined", async () => {
      const error = new AxiosError("Bad", "ERR_BAD_REQUEST");
      // error.config is undefined by default when not passing it to constructor

      const mockAdapter = vi.fn().mockRejectedValueOnce(error);
      instance.defaults.adapter = mockAdapter;
      renderHook(() => useAutoRefresh(instance, tokenRefreshFn, config));

      await expect(instance.get("/api")).rejects.toThrow();
      expect(tokenRefreshFn).not.toHaveBeenCalled();
    });

    it("matches isRefreshRequest", async () => {
      const customConfig: AutoRefreshConfig = {
        ...DEFAULT_AUTO_REFRESH_CONFIG,
        isRefreshRequest: (req) => req.url === "/auth/refresh",
      };

      const error401 = make401("/auth/refresh");

      const mockAdapter = vi.fn().mockRejectedValueOnce(error401);
      instance.defaults.adapter = mockAdapter;
      renderHook(() => useAutoRefresh(instance, tokenRefreshFn, customConfig));

      await expect(instance.post("/auth/refresh")).rejects.toThrow();
      expect(tokenRefreshFn).not.toHaveBeenCalled();
    });

    it("request already retried", async () => {
      const error401 = make401("/api/data");
      (error401.config as any)._retry = true; // eslint-disable-line @typescript-eslint/no-explicit-any

      const mockAdapter = vi.fn().mockRejectedValueOnce(error401);
      instance.defaults.adapter = mockAdapter;
      renderHook(() => useAutoRefresh(instance, tokenRefreshFn, config));

      await expect(instance.get("/api/data")).rejects.toThrow();
      expect(tokenRefreshFn).not.toHaveBeenCalled();
    });

    it("is some other error", async () => {
      const mockAdapter = vi.fn().mockRejectedValueOnce(make500("/api/data"));

      instance.defaults.adapter = mockAdapter;
      renderHook(() => useAutoRefresh(instance, tokenRefreshFn, config));

      await expect(instance.get("/api/data")).rejects.toThrow();
      expect(tokenRefreshFn).not.toHaveBeenCalled();
    });
  });
});
