import { type ReactNode, useCallback, useMemo, useState } from "react";
import { AxiosInstance } from "axios";

import { AuthContext } from "./useAuth";
import {
  AutoRefreshConfig,
  DEFAULT_AUTO_REFRESH_CONFIG,
  useAuthSyncRefresh,
  useAutoRefresh,
  useSessionInit,
} from "../utils";

interface Props {
  instance: AxiosInstance;
  children: ReactNode;
  /**
   * 토큰 갱신 API 단순 호출 함수
   */
  tokenRefreshFn: () => Promise<string>;
  /**
   * 초기화 중 보여줄 폴백 UI
   */
  fallback?: ReactNode;
  /**
   * 로그인 성공 시 호출되는 콜백
   *  - me API 호출 등 추가 작업이 필요한 경우 활용
   * @param token
   * @example
   * ```tsx
   * function onLoginSuccess(token: string) {
   *   // 사용자 정보 조회 API 호출
   *   fetchUserProfile();
   *   router.push("/dashboard");
   * }
   * ```
   */
  onLoginSuccess?: () => void;
  onLogout?: () => void;
  autoRefreshConfig?: AutoRefreshConfig;
}

/**
 * Auth 관련 기능을 한번에 제공하는 AuthProvider
 *  - Axios 사용을 가정한다
 */
export function AuthProvider({
  instance,
  children,
  tokenRefreshFn,
  fallback,
  onLoginSuccess,
  onLogout,
  autoRefreshConfig = DEFAULT_AUTO_REFRESH_CONFIG,
}: Readonly<Props>) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { broadcast } = useAuthSyncRefresh();
  useAutoRefresh(instance, tokenRefreshFn, autoRefreshConfig);

  const setAuthState = useCallback(
    async (token: string) => {
      setAccessToken(token);
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      onLoginSuccess?.();
    },
    [instance, onLoginSuccess],
  );

  const clearAuthState = useCallback(() => {
    setAccessToken(null);
    delete instance.defaults.headers.common["Authorization"];
    onLogout?.();
  }, [instance, onLogout]);

  const { isReady } = useSessionInit({
    tokenRefreshFn,
    setAuthState,
  });

  const value = useMemo(() => {
    return {
      isAuthenticated: !!accessToken,
      setAuthState,
      clearAuthState,
      broadcast,
    };
  }, [accessToken, setAuthState, clearAuthState, broadcast]);

  if (!isReady) {
    if (fallback) {
      return <>{fallback}</>;
    }
    // 기본 fallback UI
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
