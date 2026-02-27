import { AxiosError, AxiosRequestConfig, AxiosInstance } from "axios";

import { tokenRefreshAPI } from "../api/tokenRefresh";
import { getRefreshConfig } from "../configs/state";

let interceptorId: number | null = null;
type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };
let refreshPromise: Promise<string> | null = null;

function refreshOnce(instance: AxiosInstance) {
  refreshPromise ??= tokenRefreshAPI(instance).finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export function setupResponseInterceptor(instance: AxiosInstance) {
  // 응답 에러 중 "토큰 만료"로 간주되는 경우 자동으로 토큰을 갱신하고 원 요청을 재시도하는 인터셉터
  interceptorId = instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableConfig | undefined;
      const authConfig = getRefreshConfig();

      // 원 요청/응답이 없으면 개입 불가 → 그대로 던진다
      if (!error.response || !originalRequest) {
        throw error;
      }

      // 무한 루프 방지 체크 (리프레시 요청이거나, 이미 재시도한 요청)
      if (
        originalRequest.url === authConfig.endpoint ||
        originalRequest._retry
      ) {
        throw error;
      }

      // "토큰 만료"로 간주되는 에러이며 아직 재시도 안했으면 리프레시 시도
      if (authConfig.shouldRefresh(error)) {
        try {
          const newToken = await refreshOnce(instance);

          // 토큰 갱신에 성공했으면, 원 요청을 새로운 토큰으로 재시도
          originalRequest._retry = true;
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newToken}`,
          };

          return instance(originalRequest);
        } catch {
          // 토큰 갱신에 실패했으면, 원 에러 던지기. 로그아웃 처리는 tokenRefresh 함수에서 자동으로 처리
          await authConfig.onRefreshFail?.();
          throw error;
        }
      }

      // "토큰 만료"로 간주되지 않는 에러는 그대로 던진다
      throw error;
    },
  );
}

export function ejectInterceptor(instance: AxiosInstance) {
  delete instance.defaults.headers.common["Authorization"];
  // 인터셉터도 초기화한다. (예: 로그아웃 시)
  if (interceptorId !== null) {
    instance.interceptors.response.eject(interceptorId);
    interceptorId = null;
  }
}

export function setAuthHeader(instance: AxiosInstance, token: string) {
  instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export function clearAuthHeader(instance: AxiosInstance) {
  delete instance.defaults.headers.common["Authorization"];
}
