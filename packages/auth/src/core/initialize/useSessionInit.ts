import { useEffect, useRef, useState } from "react";
import { AxiosInstance } from "axios";

interface Methods {
  tokenRefreshFn: () => Promise<string>;
  setAuthState: (token: string) => Promise<void> | void;
  clearAuthState: () => Promise<void> | void;
}

/**
 * 앱을 부팅했을 때 Auth 상태를 초기화하는 훅
 *   - 토큰 리프레시 API를 호출하여, 토큰 갱신을 시도한다.
 */
export function useSessionInit(
  instance: AxiosInstance,
  { tokenRefreshFn, setAuthState, clearAuthState }: Methods,
) {
  const [isReady, setIsReady] = useState<boolean>(false); // UI 렌더링을 위한 초기화 상태
  const bootingRef = useRef(false); // 부팅 시 refreshToken 중복

  useEffect(() => {
    // 앱 부팅 시 refresh 시도
    if (bootingRef.current) return;
    bootingRef.current = true;

    (async () => {
      try {
        const accessToken = await tokenRefreshFn();

        setAuthState(accessToken);
      } catch {
        console.error(
          "Session initialization failed: unable to refresh token.",
        );

        clearAuthState();
      } finally {
        setIsReady(true);
      }
    })();

    return () => {
      bootingRef.current = false;
    };
  }, [setAuthState, clearAuthState, tokenRefreshFn]);

  useEffect(() => {
    // Axios 요청에 쿠키를 항상 포함시키도록 설정
    instance.defaults.withCredentials = true;
  }, [instance]);

  return { isReady };
}
