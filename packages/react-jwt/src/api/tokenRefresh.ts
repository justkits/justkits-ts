import { AxiosInstance } from "axios";

import { getRefreshConfig } from "../configs/state";
import { clearAuthHeader, setAuthHeader } from "../lib/axios";
import { broadcast } from "../lib/broadcast-channel";
import { updateSession } from "../lib/session";

export async function tokenRefreshAPI(instance: AxiosInstance) {
  const config = getRefreshConfig();

  try {
    const res = await instance.post(config.endpoint);
    const newToken = config.selector(res);
    setAuthHeader(instance, newToken);
    return newToken;
  } catch (error) {
    // 토큰 갱신 실패 시 로그아웃 처리
    // Defensive Programming: 그 어떤 오류라도, 로그아웃 처리를 하여 보안을 유지한다
    // 초기 로드에 실패하더라도 다른 탭에 로그인 되어있는 세션도 전부 로그아웃 처리한다
    clearAuthHeader(instance);
    broadcast("LOGOUT");
    updateSession(false);
    throw error; // 에러를 다시 던져서 호출한 곳에서도 인지할 수 있도록 함
  }
}
