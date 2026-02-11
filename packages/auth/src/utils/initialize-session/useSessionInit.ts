import { useEffect, useState } from "react";

/**
 * 앱 부팅 시 Auth 상태를 초기화하는 훅
 *  - 토큰 리프레시 API를 호출하여, 토큰 갱신을 시도한다.
 */
export function useSessionInit({
  tokenRefreshFn,
  setAuthState,
}: {
  tokenRefreshFn: () => Promise<string>;
  setAuthState: (token: string) => Promise<void> | void;
}) {
  const [isReady, setIsReady] = useState<boolean>(false); // UI 렌더링을 위한 초기화 상태

  useEffect(() => {
    // 앱 부팅 시 refresh 시도
    if (isReady) return;

    (async () => {
      try {
        const accessToken = await tokenRefreshFn();

        setAuthState(accessToken);
      } finally {
        setIsReady(true);
      }
    })();
  }, [setAuthState, tokenRefreshFn]);

  return { isReady };
}
