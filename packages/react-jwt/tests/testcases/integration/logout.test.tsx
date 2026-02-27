import { fireEvent, render, waitFor } from "@testing-library/react";
import axios from "axios";

import { mockChannelInstance, reloadMock } from "@tests/setup/global.mocks";
import { TestComponent } from "@tests/setup/TestComponents";

describe("Logout Workflow Test", () => {
  const testInstance = axios.create();

  function mockPostRequests(logoutSuccess: boolean) {
    vi.spyOn(testInstance, "post").mockImplementation((url) => {
      if (url.includes("refresh")) {
        return Promise.resolve({
          status: 200,
          data: "mocked-jwt-token",
        });
      } else {
        // 로그아웃
        if (logoutSuccess) {
          return Promise.resolve({
            status: 204,
          });
        }
        return Promise.reject(
          new Error(
            JSON.stringify({
              response: {
                status: 500,
                data: "Server error",
              },
            }),
          ),
        );
      }
    });
  }

  beforeEach(() => {
    vi.resetModules();
  });

  it("handles logout flow correctly", async () => {
    mockPostRequests(true);
    vi.spyOn(testInstance, "get").mockResolvedValue({
      status: 200,
      data: { user: { id: 1, name: "Test User" } },
    });

    const { getByText } = render(<TestComponent instance={testInstance} />);

    // 초기에 로딩 UI가 보여지는지 확인
    expect(getByText("Loading Fallback")).toBeTruthy();

    // 조금 기다리면 대시보드 페이지가 렌더링되는지 확인
    await waitFor(() => {
      expect(getByText("Dashboard")).toBeTruthy();
    });

    // 로그아웃 버튼 클릭 시 로그아웃 API가 호출되는지 확인
    const logoutButton = getByText("Logout");
    fireEvent.click(logoutButton);

    await waitFor(() => {
      // 로그아웃 후 로그인 페이지로 돌아오는지 확인
      expect(getByText("Login Form")).toBeTruthy();
    });
  });

  it("handles logout failure correctly", async () => {
    // 로그아웃 API가 실패해도, 클라이언트 상태는 초기화되어야 한다.
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockPostRequests(false);
    vi.spyOn(testInstance, "get").mockResolvedValue({
      status: 200,
      data: { user: { id: 1, name: "Test User" } },
    });

    const { getByText } = render(<TestComponent instance={testInstance} />);

    // 조금 기다리면 대시보드 페이지가 렌더링되는지 확인
    await waitFor(() => {
      expect(getByText("Dashboard")).toBeTruthy();
    });

    // 로그아웃 버튼 클릭 시 로그아웃 API가 호출되는지 확인
    const logoutButton = getByText("Logout");
    fireEvent.click(logoutButton);

    await waitFor(() => {
      // 로그아웃 후 로그인 페이지로 돌아오는지 확인
      expect(getByText("Login Form")).toBeTruthy();
    });

    // 콘솔에 에러가 찍히는지 확인
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Logout API call failed:",
      expect.objectContaining({
        message: expect.stringContaining("Server error"),
      }),
    );
  });

  it("handles logout from another tab", async () => {
    // 탭이 로그인 상태일 때, 다른 탭에서 로그아웃이 발생하면 현재 탭을 새로고침해야 한다.
    mockPostRequests(true);
    vi.spyOn(testInstance, "get").mockResolvedValue({
      status: 200,
      data: { user: { id: 1, name: "Test User" } },
    });

    const { getByText } = render(<TestComponent instance={testInstance} />);

    // 인증 상태에서 대시보드가 보여지는지 확인
    await waitFor(() => {
      expect(getByText("Dashboard")).toBeTruthy();
    });

    // 다른 탭에서 LOGOUT 브로드캐스트 메시지 수신 시뮬레이션
    mockChannelInstance.onmessage?.(
      new MessageEvent("message", { data: "LOGOUT" }),
    );

    // 현재 탭이 세션 저장소에 플래그를 설정하고 페이지를 새로고침해야 한다
    expect(reloadMock).toHaveBeenCalled();
    expect(sessionStorage.getItem("@justkits/react-jwt")).toBe("LOGOUT");
  });
});
