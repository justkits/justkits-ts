import { AxiosInstance } from "axios";

import { getLogoutConfig } from "../configs/state";
import { clearAuthHeader } from "../lib/axios";
import { broadcast } from "../lib/broadcast-channel";
import { updateSession } from "../lib/session";

export async function logoutAPI(instance: AxiosInstance) {
  // 로그아웃 API 호출 (실패해도 클라이언트 상태는 초기화)
  // 실패해도 클라이언트 상태는 초기화해야 하기 때문에 try-catch-finally 구조로 작성
  const config = getLogoutConfig();

  try {
    await instance.post(config.endpoint);
  } finally {
    clearAuthHeader(instance);
    broadcast("LOGOUT");
    updateSession(false);
  }
}
