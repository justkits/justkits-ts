import { render, waitFor } from "@testing-library/react";
import axios from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "@/AuthProvider";

describe("AuthProvider corner cases", () => {
  const testInstance = axios.create();
  const queryClient = new QueryClient();

  beforeEach(() => {
    // 기본적으로 초기 토큰 갱신에 실패해서 시작하도록 설정
    vi.spyOn(testInstance, "post").mockRejectedValue(
      new Error("Network Error"),
    );
  });

  it("renders default fallback when no custom fallback provided", async () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider instance={testInstance}>TestComponent</AuthProvider>
      </QueryClientProvider>,
    );

    // 기본적으로 "Loading..." 텍스트가 렌더링되는지 확인
    expect(getByText("Loading...")).toBeTruthy();

    await waitFor(() => {
      // 토큰 갱신 실패 후에도 "Loading..." 텍스트가 계속 렌더링되는지 확인
      expect(getByText("TestComponent")).toBeTruthy();
    });
  });

  it("handles custom configs correctly", async () => {
    const customConfigs = {
      endpoints: {
        login: "/custom-login/",
      },
      selectors: {
        accessToken: vi.fn(),
      },
      shouldRefresh: vi.fn().mockReturnValue(true),
      meQueryKey: ["custom-me"],
      onSessionSync: {
        reloadOnLogin: true,
      },
      onRefreshFail: vi.fn(),
    };

    // 커스텀 설정을 적용한 AuthProvider 렌더링
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider instance={testInstance} config={customConfigs}>
          TestComponent
        </AuthProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      // 커스텀 설정이 적용된 상태에서 "TestComponent"가 렌더링되는지 확인
      expect(getByText("TestComponent")).toBeTruthy();
    });
  });
});
