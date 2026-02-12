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
  tokenRefreshAPICall: () => Promise<string>;
  /**
   * 초기화 중 보여줄 폴백 UI
   */
  fallback?: ReactNode;
  /**
   * 로그아웃 시 호출되는 콜백
   * @example
   * ```tsx
   * function onLogout() {
   *   // 모든 쿼리 초기화 + 로그인 페이지로 이동
   *   invalidateQueries();
   *   router.push("/login");
   * }
   */
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
  tokenRefreshAPICall,
  fallback,
  onLogout,
  autoRefreshConfig = DEFAULT_AUTO_REFRESH_CONFIG,
}: Readonly<Props>) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { broadcast } = useAuthSyncRefresh();

  const setAuthState = useCallback(
    (token: string) => {
      setAccessToken(token);
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    },
    [instance],
  );

  const clearAuthState = useCallback(() => {
    setAccessToken(null);
    delete instance.defaults.headers.common["Authorization"];
    onLogout?.();
  }, [instance, onLogout]);

  const tokenRefreshFn = useCallback(async () => {
    const newToken = await tokenRefreshAPICall();

    setAuthState(newToken);
    return newToken;
  }, [tokenRefreshAPICall, setAuthState]);

  const { isReady } = useSessionInit({
    tokenRefreshFn,
    setAuthState,
  });
  useAutoRefresh(instance, tokenRefreshFn, autoRefreshConfig);

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
