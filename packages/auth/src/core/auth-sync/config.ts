export type AuthEventType = "LOGIN_SUCCESS" | "LOGOUT";

export type UseAuthSyncConfig = {
  /**
   * 다른 탭에서 로그인 성공 시, 본 탭에서도 토큰을 갱신하기 위해 token refresh 함수를 호출한다.
   *  - 단순 API 호출 함수가 아닌, 토큰을 갱신하는 함수를 전달해야 한다.
   *  - 예) useTokenRefresh() 훅을 통해 얻은 함수
   */
  tokenRefreshFn: () => Promise<string>;
  /**
   * 로그아웃 시 호출되는 콜백
   * !!여기에 로그아웃 메시지를 전파하는 로직을 넣으면 안된다!! (무한 루프 발생)
   * @example
   * function clearAuthState() {
   *   clearUserState();
   *   router.push("/login");
   * }
   */
  clearAuthState: () => Promise<void> | void;
  /**
   * BroadcastChannel 이름. 같은 origin에서 여러 앱을 운영할 경우 구분용으로 사용한다.
   * @default "@justkits/auth"
   */
  channelName?: string;
};
