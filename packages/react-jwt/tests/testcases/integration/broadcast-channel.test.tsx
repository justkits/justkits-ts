import { render, waitFor } from "@testing-library/react";
import axios from "axios";

import {
  closeAuthChannel,
  initializeAuthChannel,
} from "@/lib/broadcast-channel";
import { mockChannelInstance, reloadMock } from "@tests/setup/global.mocks";
import { TestComponent } from "@tests/setup/TestComponents";

describe("BroadcastChannel Sync Test", () => {
  const testInstance = axios.create();

  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
  });

  it("calls LOGIN_SUCCESS callback directly when reloadOnLogin is false", async () => {
    // reloadOnLogin: false이면, 다른 탭의 LOGIN_SUCCESS 이벤트 수신 시 콜백을 바로 호출해야 한다 (새로고침 없이)
    const loginSuccessCallback = vi.fn();
    vi.spyOn(testInstance, "post").mockRejectedValue(
      new Error("Refresh failed"),
    );

    const { getByText } = render(
      <TestComponent
        instance={testInstance}
        config={{
          onSessionSync: {
            reloadOnLogin: false,
            LOGIN_SUCCESS: loginSuccessCallback,
          },
        }}
      />,
    );

    await waitFor(() => {
      expect(getByText("Login Form")).toBeTruthy();
    });

    // 다른 탭에서 LOGIN_SUCCESS 브로드캐스트 메시지 수신 시뮬레이션
    mockChannelInstance.onmessage?.(
      new MessageEvent("message", { data: "LOGIN_SUCCESS" }),
    );

    // reloadOnLogin: false이므로 콜백이 즉시 호출되고, reload는 발생하지 않아야 한다
    expect(loginSuccessCallback).toHaveBeenCalled();
    expect(reloadMock).not.toHaveBeenCalled();
  });

  it("calls LOGIN_SUCCESS callback on init when sessionStorage has LOGIN_SUCCESS flag", async () => {
    // 다른 탭의 로그인으로 인해 reload가 발생한 후, 새로 로드된 탭이 sessionStorage 플래그를 읽고 콜백을 호출해야 한다
    const loginSuccessCallback = vi.fn();
    vi.spyOn(testInstance, "post").mockRejectedValue(
      new Error("Refresh failed"),
    );

    // 다른 탭의 LOGIN_SUCCESS 브로드캐스트 → reload 직전 sessionStorage에 플래그 저장
    sessionStorage.setItem("@justkits/react-jwt", "LOGIN_SUCCESS");

    render(
      <TestComponent
        instance={testInstance}
        config={{
          onSessionSync: {
            reloadOnLogin: true,
            LOGIN_SUCCESS: loginSuccessCallback,
          },
        }}
      />,
    );

    // 초기화 시 콜백이 호출되어야 한다
    await waitFor(() => {
      expect(loginSuccessCallback).toHaveBeenCalled();
    });

    // 플래그는 읽은 후 즉시 제거되어야 한다
    expect(sessionStorage.getItem("@justkits/react-jwt")).toBeNull();
  });

  it("calls LOGOUT callback on init when sessionStorage has LOGOUT flag", async () => {
    // 다른 탭의 로그아웃으로 인해 reload가 발생한 후, 새로 로드된 탭이 sessionStorage 플래그를 읽고 콜백을 호출해야 한다
    const logoutCallback = vi.fn();
    vi.spyOn(testInstance, "post").mockRejectedValue(
      new Error("Refresh failed"),
    );

    // 다른 탭의 LOGOUT 브로드캐스트 → reload 직전 sessionStorage에 플래그 저장
    sessionStorage.setItem("@justkits/react-jwt", "LOGOUT");

    render(
      <TestComponent
        instance={testInstance}
        config={{
          onSessionSync: {
            reloadOnLogin: false,
            LOGOUT: logoutCallback,
          },
        }}
      />,
    );

    // 초기화 시 콜백이 호출되어야 한다
    await waitFor(() => {
      expect(logoutCallback).toHaveBeenCalled();
    });

    // 플래그는 읽은 후 즉시 제거되어야 한다
    expect(sessionStorage.getItem("@justkits/react-jwt")).toBeNull();
  });

  it("ignores unknown broadcast message types", async () => {
    // 알 수 없는 메시지 타입은 무시되어야 한다
    vi.spyOn(testInstance, "post").mockRejectedValue(
      new Error("Refresh failed"),
    );

    const { getByText } = render(<TestComponent instance={testInstance} />);

    await waitFor(() => {
      expect(getByText("Login Form")).toBeTruthy();
    });

    // 알 수 없는 이벤트 타입 수신 → 아무 동작도 하지 않아야 한다
    mockChannelInstance.onmessage?.(
      new MessageEvent("message", { data: "UNKNOWN_EVENT" }),
    );

    expect(reloadMock).not.toHaveBeenCalled();
  });
});

describe("initializeAuthChannel - BroadcastChannel unavailable", () => {
  it("returns early when BroadcastChannel is not defined", () => {
    // BroadcastChannel이 없는 환경(예: 일부 구형 브라우저)에서는 조용히 무시해야 한다
    const saved = globalThis.BroadcastChannel;
    // @ts-expect-error intentionally testing undefined environment
    globalThis.BroadcastChannel = undefined;

    try {
      expect(() => initializeAuthChannel()).not.toThrow();
    } finally {
      globalThis.BroadcastChannel = saved;
      closeAuthChannel();
    }
  });
});
