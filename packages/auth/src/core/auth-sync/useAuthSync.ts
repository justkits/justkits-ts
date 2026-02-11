import { useCallback, useEffect, useRef } from "react";

import type { AuthEventType, UseAuthSyncConfig } from "./config";

/**
 * BroadcastChannel API를 활용하여 브라우저 탭 간 인증 이벤트를 동기화하는 Hook.
 *   - 로그인에 성공하면, 토큰을 갱신하기 위해 tokenRefreshFn()을 호출
 *   - 로그아웃하면, clearAuthState()를 호출
 *   - 토큰 갱신하면, 아무 동작도 필요 없다 (다른 탭에서 요청이 갈 때, 자동으로 쿠키가 붙기 때문)
 *
 * 여러 탭에서 로그인/로그아웃 상태를 동기화하기 위한 훅
 *   - 인증 상태가 한 탭에서 바뀌면, 다른 모든 탭에 이를 알리는 기능과 (로그인 성공, 로그아웃, 토큰 갱신)
 *
 * !중요! 토큰 리프레시 실패 시 로그아웃 신호를 전파해야 한다.
 */
export function useAuthSync(config: Readonly<UseAuthSyncConfig>) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const { channelName = "@justkits/auth" } = config;

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(channelName);
    channelRef.current = channel;

    // 메시지 수신 처리
    channel.onmessage = (event: MessageEvent) => {
      if (!["LOGIN_SUCCESS", "LOGOUT"].includes(event.data)) return;

      if (event.data === "LOGIN_SUCCESS") config.tokenRefreshFn();
      else if (event.data === "LOGOUT") config.clearAuthState();
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [channelName]);

  // 이벤트 브로드캐스트 함수
  const broadcast = useCallback((event: AuthEventType) => {
    channelRef.current?.postMessage(event);
  }, []);

  return { broadcast };
}
