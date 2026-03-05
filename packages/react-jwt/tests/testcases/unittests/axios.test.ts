import axios from "axios";

import {
  clearAuthHeader,
  ejectInterceptor,
  setAuthHeader,
  setupResponseInterceptor,
} from "@/lib/axios";

describe("axios corner cases", () => {
  it("does nothing when called before setupResponseInterceptor (interceptorId is null)", () => {
    const testInstance = axios.create();
    const ejectSpy = vi.spyOn(testInstance.interceptors.response, "eject");

    // interceptorId is null at module init — should not call eject
    ejectInterceptor(testInstance);

    expect(ejectSpy).not.toHaveBeenCalled();
  });

  it("ejects the interceptor when called after setupResponseInterceptor", () => {
    const testInstance = axios.create();
    const ejectSpy = vi.spyOn(testInstance.interceptors.response, "eject");

    setupResponseInterceptor(testInstance);
    ejectInterceptor(testInstance);

    expect(ejectSpy).toHaveBeenCalledTimes(1);
  });

  it("inserts the auto-refresh interceptor before any pre-existing interceptors", () => {
    const testInstance = axios.create();
    const normalizationHandler = vi.fn();

    // Simulate buildInstance() registering a normalization interceptor first
    testInstance.interceptors.response.use((r) => r, normalizationHandler);

    setupResponseInterceptor(testInstance);

    const handlers = testInstance.interceptors.response.handlers ?? [];
    expect(handlers).toHaveLength(2);
    // auto-refresh is at index 0, normalization is pushed to index 1
    expect(handlers[0]?.rejected).not.toBe(normalizationHandler);
    expect(handlers[1]?.rejected).toBe(normalizationHandler);
  });
});

describe("setAuthHeader / clearAuthHeader", () => {
  it("sets the Authorization header on the instance", () => {
    const testInstance = axios.create();
    setAuthHeader(testInstance, "my-token");
    expect(testInstance.defaults.headers.common["Authorization"]).toBe(
      "Bearer my-token",
    );
  });

  it("clears the Authorization header from the instance", () => {
    const testInstance = axios.create();
    setAuthHeader(testInstance, "my-token");
    clearAuthHeader(testInstance);
    expect(
      testInstance.defaults.headers.common["Authorization"],
    ).toBeUndefined();
  });
});
