import { AxiosError, AxiosResponse } from "axios";

import { UserType } from "../models/user";

type Endpoints = {
  login: string;
  logout: string;
  refresh: string;
  me: string;
};

type Selectors = {
  // 로그인/토큰 갱신 API 응답에서 accessToken을 어떻게 가져올지 선택하는 함수
  accessToken: (response: AxiosResponse) => string;
  // me API 응답에서 유저 정보를 어떻게 가져올지 선택하는 함수
  user: (response: AxiosResponse) => UserType;
};

type SessionSyncConfig = {
  /**
   * 로그인 이벤트 발생 시 페이지를 새로고침할지 여부. 로그아웃 이벤트는 항상 새로고침한다
   *  - true로 설정하면, 로그인 이벤트 발생 시 먼저 전체 페이지를 새로고침하고, 그 뒤에 LOGIN_SUCCESS 콜백이 호출된다.
   *  - false로 설정하면, 곧바로 LOGIN_SUCCESS 콜백이 호출된다.
   * @default false
   */
  reloadOnLogin: boolean;
  /**
   * 로그인 이벤트 발생 시 호출할 콜백
   *  - 여기서 router 이벤트를 호출하는 것은 권장되지 않는다.
   *  - 본 라이브러리의 <AuthBoundary>와 <GuestsOnly> 레퍼 컴포넌트를 통해 처리하는 것을 권장한다.
   * @example
   * ```tsx
   * const onLoginSuccess = () => {
   *  // reloadOnLogin이 true인 경우 예시
   *  toast("다른 탭에서 로그인되어 세션을 갱신했습니다!");
   *  // reloadOnLogin이 false인 경우 예시
   *  // toast("인증 상태에 변화가 생겼습니다. 페이지를 새로고침해주세요!");
   * };
   * ```
   */
  LOGIN_SUCCESS?: () => void | Promise<void>;
  /**
   * 로그아웃 이벤트 발생 시 호출할 콜백
   *  - 여기서 router 이벤트를 호출하는 것은 권장되지 않는다.
   *  - 본 라이브러리의 <AuthBoundary>와 <GuestsOnly> 레퍼 컴포넌트를 통해 처리하는 것을 권장한다.
   * @example
   * ```tsx
   * const onLogout = () => {
   *  // toast("다른 탭에서 로그아웃되어 세션이 만료되었습니다!");
   * };
   * ```
   */
  LOGOUT?: () => void | Promise<void>;
};

export type AuthConfig = {
  endpoints: Endpoints;
  selectors: Selectors;
  /**
   * 토큰 갱신이 필요한지 판단하는 프레디케이트 즉, 토큰 만료 감지 함수
   * @example (err) => err.response?.status === 403 && err.response?.data?.code === "TOKEN_EXPIRED"
   * @default (err) => err.response?.status === 401
   */
  shouldRefresh: (err: AxiosError) => boolean;
  /**
   * me API를 위한 Tanstack Query의 쿼리 키.
   * @default ["me"]
   */
  meQueryKey: string[];
  /**
   * 로그인/로그아웃 이벤트에 대한 옵션
   * @default { reloadOnLogin: false }
   */
  onSessionSync: SessionSyncConfig;
  /**
   * 토큰 갱신 실패 시 호출되는 콜백 함수. 단, 초기 렌더링 시 토큰 갱신에 실패한 경우에는 이 콜백이 호출되지 않는다.
   * @example
   * ```tsx
   * const onRefreshFail = () => {
   *  toast("세션이 만료되었습니다. 다시 로그인해주세요.");
   * };
   * ```
   */
  onRefreshFail?: () => void | Promise<void>;
};

export type AuthConfigInput = {
  endpoints?: Partial<Endpoints>;
  selectors?: Partial<Selectors>;
  shouldRefresh?: AuthConfig["shouldRefresh"];
  meQueryKey?: string[];
  onSessionSync?: SessionSyncConfig;
  onRefreshFail?: AuthConfig["onRefreshFail"];
};
