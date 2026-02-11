import { useEffect } from "react";
import { AxiosError, type AxiosRequestConfig, AxiosInstance } from "axios";

import { AutoRefreshConfig } from "./config";

export type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };

/**
 * 자동 리프레시 훅. Provider에 단순히 선언만 해주면 된다.
 * @property instance 자동 리프레시 기능을 적용할 Axios 인스턴스
 * @property tokenRefreshFn 토큰 리프레시 함수
 * @property config 자동 리프레시 설정
 */
export function useAutoRefresh(
  instance: AxiosInstance,
  tokenRefreshFn: () => Promise<string>,
  config: AutoRefreshConfig,
) {
  async function errorResponseHandler(error: AxiosError) {
    const originalRequest = error.config as RetryableConfig | undefined;

    // 원 요청/응답이 없으면 개입 불가 → 그대로 던진다
    if (!error.response || !originalRequest) {
      throw error;
    }

    // 무한 루프 방지 체크 (리프레시 요청이거나, 이미 재시도한 요청)
    if (config.isRefreshRequest?.(originalRequest) || originalRequest._retry) {
      throw error;
    }

    // "토큰 만료"로 간주되는 에러이며 아직 재시도 안했으면 리프레시 시도
    if (config.shouldRefresh(error)) {
      try {
        const newToken = await tokenRefreshFn();

        // 토큰 갱신에 성공했으면, 원 요청을 새로운 토큰으로 재시도
        originalRequest._retry = true;
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        };

        return instance(originalRequest);
      } catch {
        // 토큰 갱신에 실패했으면, 원 에러 던지기
        throw error;
      }
    }

    // 그 외의 경우는 개입하지 않는다
    throw error;
  }

  useEffect(() => {
    // 인터셉터 설치
    const id = instance.interceptors.response.use(
      (response) => response,
      errorResponseHandler,
    );

    return () => {
      // 인터셉터 해제
      instance.interceptors.response.eject(id);
    };
  }, [instance, tokenRefreshFn, config]);
}
