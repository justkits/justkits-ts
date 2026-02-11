import { AxiosError, type AxiosRequestConfig } from "axios";

export type AutoRefreshConfig = {
  /**
   * 토큰 갱신이 필요한지 판단하는 프레디케이트 즉, 토큰 만료 감지 함수
   * @example (err) => err.response?.status === 401
   * @example (err) => err.response?.status === 403 && err.response?.data?.code === "TOKEN_EXPIRED"
   */
  shouldRefresh: (err: AxiosError) => boolean;
  /**
   * 리프레시 요청인지 식별하는 함수. 무한 루프 방지를 위해 필요
   * @example (config) => config.url?.includes("/auth/refresh")
   */
  isRefreshRequest?: (config: AxiosRequestConfig) => boolean;
};

export const DEFAULT_AUTO_REFRESH_CONFIG: AutoRefreshConfig = {
  shouldRefresh: (err) => err.response?.status === 401,
  isRefreshRequest: (config) => config.url?.includes("/auth/refresh") ?? false,
};
