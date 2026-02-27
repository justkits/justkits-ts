import { render, waitFor } from "@testing-library/react";
import axios from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthBoundary } from "@/components/AuthBoundary";
import { AuthProvider } from "@/AuthProvider";

describe("AuthBoundary corner cases", () => {
  it("calls onUnauthorized callback when not authenticated and onUnauthorized is provided", async () => {
    const onUnauthorizedMock = vi.fn();
    const testInstance = axios.create();
    const queryClient = new QueryClient();

    vi.spyOn(testInstance, "post").mockRejectedValue({});

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider instance={testInstance}>
          <AuthBoundary onUnauthorized={onUnauthorizedMock}>
            <div>Protected Content</div>
          </AuthBoundary>
        </AuthProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(onUnauthorizedMock).toHaveBeenCalledTimes(1);
    });
  });
});
