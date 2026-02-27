import { fireEvent, render, waitFor } from "@testing-library/react";
import axios from "axios";

import { TestComponent } from "@tests/setup/TestComponents";

describe("User Refetch Workflow Test", () => {
  const testInstance = axios.create();
  it("handles user refetch flow correctly", async () => {
    vi.spyOn(testInstance, "post").mockImplementation((url) => {
      // 로그아웃은 성공
      if (url === "/logout/") {
        return Promise.resolve({ status: 204 });
      }
      // 토큰 갱신도 성공
      return Promise.resolve({
        status: 200,
        data: "mocked-jwt-token",
      });
    });
    vi.spyOn(testInstance, "get")
      .mockResolvedValueOnce({
        status: 200,
        data: { id: 1, name: "Initial User" },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: { id: 1, name: "Updated User" },
      });

    const { getByText } = render(<TestComponent instance={testInstance} />);

    // 초기에 로딩 UI가 보여지는지 확인
    expect(getByText("Loading Fallback")).toBeTruthy();

    // 조금 기다리면 대시보드 페이지가 렌더링되는지 확인
    await waitFor(() => {
      expect(getByText("Dashboard")).toBeTruthy();
      expect(getByText("Initial User")).toBeTruthy();
    });

    // Refetch User 버튼 클릭 시 사용자 정보가 갱신되는지 확인
    const refetchButton = getByText("Refetch User");
    fireEvent.click(refetchButton);

    await waitFor(() => {
      // 사용자 정보가 "Updated User"로 갱신되는지 확인
      expect(getByText("Updated User")).toBeTruthy();
    });
  });
});
