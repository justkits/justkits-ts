import axios from "axios";

import { tokenRefreshAPI } from "@/api/tokenRefresh";
import { initializeSession, getSnapshot, resetSession } from "@/lib/session";

vi.mock("@/api/tokenRefresh");

describe("session corner cases", () => {
  const testInstance = axios.create();

  beforeEach(() => {
    resetSession();
    vi.clearAllMocks();
  });

  it("does nothing if session is already ready", async () => {
    vi.mocked(tokenRefreshAPI).mockResolvedValue("token");

    initializeSession(testInstance);
    await vi.waitFor(() => expect(getSnapshot().isReady).toBe(true));

    initializeSession(testInstance);

    expect(tokenRefreshAPI).toHaveBeenCalledTimes(1);
  });
});
