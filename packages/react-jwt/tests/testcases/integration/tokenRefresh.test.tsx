import { render, waitFor } from "@testing-library/react";
import axios from "axios";

import { createAdapterMock } from "@tests/setup/adapterMock";
import { TestComponent } from "@tests/setup/TestComponents";

// TestComponent and testInstance are imported dynamically per test (after vi.resetModules())
// so that session.ts module-level state (isReady) starts fresh for every test.
// Without this, AuthProvider's cleanup calls resetSession() → isReady: true, and
// subsequent tests skip initializeSession entirely, making the interceptor never run.

describe("Token Refresh Workflow Test", () => {
  const testInstance = axios.create();
  beforeEach(() => {
    vi.resetModules();
  });

  // 초기 로드 말고, response가 만료되었을 때 토큰 갱신 테스트
  it("handles token refresh success correctly", async () => {
    testInstance.defaults.adapter = createAdapterMock({
      "POST /tokens/refresh/": [
        { status: 200, data: "initial-jwt-token" },
        { status: 200, data: "renewed-jwt-token" },
      ],
      "GET /me/": [
        { status: 401, data: "Token expired" },
        { status: 200, data: { id: 1, name: "Test User" } },
      ],
    });

    const { getByText } = render(<TestComponent instance={testInstance} />);

    expect(getByText("Loading Fallback")).toBeTruthy();

    // 인터셉터가 401을 감지 → 토큰 갱신 → 원 요청 재시도 → 성공
    await waitFor(() => {
      expect(getByText("Dashboard")).toBeTruthy();
      expect(getByText("Test User")).toBeTruthy();
    });
  });

  it("handles token refresh failure correctly", async () => {
    // 인터셉터의 토큰 갱신 POST 자체가 실패해야 updateSession(false)가 호출된다.
    // (POST가 성공하면 재시도 GET만 실패하고, isAuthenticated는 여전히 true로 남는다)
    testInstance.defaults.adapter = createAdapterMock({
      "POST /tokens/refresh/": [
        { status: 200, data: "initial-jwt-token" }, // initializeSession 성공
        { status: 401, data: "Refresh token expired" }, // 인터셉터의 갱신 시도 실패
      ],
      "GET /me/": { status: 401, data: "Token expired" },
    });

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { getByText } = render(<TestComponent instance={testInstance} />);

    await waitFor(() => {
      // 토큰 갱신 실패 → updateSession(false) → 로그인 페이지
      expect(getByText("Login Form")).toBeTruthy();
    });

    consoleErrorSpy.mockRestore();
  });

  it("doesn't try to refresh token if response is undefined", async () => {
    // 갱신 요청 자체가 네트워크 에러(response 없음)이면, 인터셉터가 개입하지 않고 바로 던진다.
    // → tokenRefreshAPI catch → updateSession(false) → 로그인 페이지
    testInstance.defaults.adapter = createAdapterMock({
      "POST /tokens/refresh/": [
        { status: 200, data: "initial-jwt-token" }, // initializeSession 성공
        null, // 인터셉터의 갱신 시도 → 네트워크 에러
      ],
      "GET /me/": { status: 401, data: "Token expired" },
    });

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { getByText } = render(<TestComponent instance={testInstance} />);

    await waitFor(() => {
      expect(getByText("Login Form")).toBeTruthy();
    });

    consoleErrorSpy.mockRestore();
  });

  it("doesn't try to refresh token for non-401 errors", async () => {
    // shouldRefresh = (err) => err.response?.status === 401
    // 500 에러는 shouldRefresh가 false → 인터셉터가 개입하지 않고 그대로 던진다 (토큰 갱신 안 함)
    // → isAuthenticated는 그대로 유지됨 (로그아웃 안 됨)
    testInstance.defaults.adapter = createAdapterMock({
      "POST /tokens/refresh/": { status: 200, data: "initial-jwt-token" },
      "GET /me/": { status: 500, data: "Internal Server Error" },
    });

    const { getByText } = render(<TestComponent instance={testInstance} />);

    await waitFor(() => {
      expect(getByText("Dashboard")).toBeTruthy();
    });
  });

  it("doesn't refresh token if the request is already a retry", async () => {
    // 인터셉터가 이미 재시도한 요청에는 또 개입하지 않아야 한다 (무한 루프 방지)
    // 재시도 GET도 실패하지만, refresh POST가 이미 성공했으므로 updateSession(false)는 호출되지 않음
    // → isAuthenticated는 그대로 유지됨 (로그아웃 안 됨)
    testInstance.defaults.adapter = createAdapterMock({
      "POST /tokens/refresh/": [
        { status: 200, data: "initial-jwt-token" }, // initializeSession 성공
        { status: 200, data: "renewed-jwt-token" }, // 인터셉터의 갱신 시도 성공
      ],
      "GET /me/": [
        { status: 401, data: "Token expired" }, // 원 요청 → 인터셉터 개입 → 토큰 갱신
        { status: 401, data: "Token expired" }, // 재시도 → _retry: true → 인터셉터 개입 안 함
      ],
    });

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { getByText } = render(<TestComponent instance={testInstance} />);

    await waitFor(() => {
      // refresh POST가 성공했으므로 isAuthenticated는 유지 → 대시보드 유지
      expect(getByText("Dashboard")).toBeTruthy();
    });

    consoleErrorSpy.mockRestore();
  });
});
