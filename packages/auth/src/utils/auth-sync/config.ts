export const AUTH_SYNC_CHANNEL_NAME = "@justkits/auth";
export type AuthEventType = "LOGIN_SUCCESS" | "LOGOUT";

export type AuthSyncConfig = {
  /**
   * 다른 탭에서 로그인 성공 시, 본 탭에서 실행할 함수
   * @example
   * function onLoginSuccess() {
   *   toast("다른 탭에서 로그인 성공 감지!");
   * }
   */
  onLoginSuccess?: () => void | Promise<void>;
};

export type SilentAuthSyncConfig = {
  /**
   * 다른 탭에서 로그인 성공 시, 본 탭에서 실행할 함수
   * @example
   * function onLoginSuccess() {
   *   fetchUserProfile();
   *   router.push("/dashboard");
   * }
   * @example
   * async function onLoginSuccess() {
   *   await tokenRefresh();
   * }
   */
  onLoginSuccess: () => void | Promise<void>;
};
