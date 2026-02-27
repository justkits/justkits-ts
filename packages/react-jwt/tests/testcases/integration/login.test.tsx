import { fireEvent, render, waitFor } from "@testing-library/react";
import axios from "axios";

import { mockChannelInstance, reloadMock } from "@tests/setup/global.mocks";
import { TestComponent } from "@tests/setup/TestComponents";

describe("Login Workflow Test", () => {
  const testInstance = axios.create();

  it("handles login flow correctly", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(testInstance, "post").mockImplementation((url) => {
      // 로그인은 성공
      if (url === "/login/") {
        return Promise.resolve({
          status: 200,
          data: "mocked-jwt-token",
        });
      }
      // 토큰 갱신은 실패 (초기 로드 시 refresh API 호출 대비)
      return Promise.reject(new Error("Token refresh failed"));
    });
    // me API는 성공
    vi.spyOn(testInstance, "get").mockResolvedValue({
      status: 200,
      data: { user: { id: 1, name: "Test User" } },
    });

    const { getByText } = render(<TestComponent instance={testInstance} />);

    // 초기에 로딩 UI가 보여지는지 확인
    expect(getByText("Loading Fallback")).toBeTruthy();

    // 조금 기다리면 로그인 페이지가 렌더링되는지 확인
    await waitFor(() => {
      expect(getByText("Login Form")).toBeTruthy();
    });

    // 로그인 버튼 클릭 시 로그인 API가 호출되는지 확인
    const loginButton = getByText("Login");
    fireEvent.click(loginButton);

    await waitFor(() => {
      // 로그인 후 대시보드 페이지로 넘어오는지 확인
      expect(getByText("Dashboard")).toBeTruthy();
    });
  });

  it("handles login failure correctly", async () => {
    // 로그인에 실패하면, 그냥 에러를 던져야 한다.
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.spyOn(testInstance, "post").mockImplementation((url) => {
      if (url === "/login/") {
        return Promise.reject(
          new Error(
            JSON.stringify({
              response: {
                status: 401,
                data: "Invalid credentials",
              },
            }),
          ),
        );
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { getByText } = render(<TestComponent instance={testInstance} />);

    // 조금 기다리면 로그인 페이지가 렌더링되는지 확인
    await waitFor(() => {
      expect(getByText("Login Form")).toBeTruthy();
    });

    // 로그인 버튼 클릭 시 로그인 API가 호출되는지 확인
    const loginButton = getByText("Login");
    fireEvent.click(loginButton);

    await waitFor(() => {
      // 로그인 실패 시 에러 메시지가 보여지는지 확인
      expect(getByText("Login Failed")).toBeTruthy();
      // 에러가 정상적으로 콘솔에 출력되는지 확인
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Login failed:",
        expect.objectContaining({
          message: expect.stringContaining("Invalid credentials"),
        }),
      );
      // 그리고 로그인 페이지에 머물러야 한다
      expect(getByText("Login Form")).toBeTruthy();
    });
  });

  it("handles login success from another tab", async () => {
    // 탭이 비로그인 상태일 때, 다른 탭에서 로그인이 성공하면 현재 탭을 새로고침해야 한다.
    vi.spyOn(testInstance, "post").mockRejectedValue(
      new Error("Refresh failed"),
    );

    const { getByText } = render(
      <TestComponent
        instance={testInstance}
        config={{ onSessionSync: { reloadOnLogin: true } }}
      />,
    );

    // 비인증 상태에서 로그인 페이지가 보여지는지 확인
    await waitFor(() => {
      expect(getByText("Login Form")).toBeTruthy();
    });

    // 다른 탭에서 LOGIN_SUCCESS 브로드캐스트 메시지 수신 시뮬레이션
    mockChannelInstance.onmessage?.(
      new MessageEvent("message", { data: "LOGIN_SUCCESS" }),
    );

    // 현재 탭이 세션 저장소에 플래그를 설정하고 페이지를 새로고침해야 한다
    expect(reloadMock).toHaveBeenCalled();
    expect(sessionStorage.getItem("@justkits/react-jwt")).toBe("LOGIN_SUCCESS");
  });
});
