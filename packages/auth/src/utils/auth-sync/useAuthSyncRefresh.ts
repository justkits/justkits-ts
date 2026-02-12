import { useCallback, useEffect, useRef } from "react";

import { AUTH_SYNC_CHANNEL_NAME } from "./config";

/**
 * 다른 탭에서 인증 상태 변경이 감지되었을 때 강제 새로고침을 수행하여 인증 상태를 동기화하는 훅
 *  - 다른 탭에서 인증 상태가 변경될 때는 자동으로 감지하여 새로고침을 수행하지만
 *  - 본 탭에서 인증 상태가 바뀔 때는, 아래 example처럼 호출을 해주어야 한다.
 *  - [!중요!] 토큰 리프레시 실패 시 로그아웃 신호를 전파해야 한다.
 * @example
 * import { useAuthSyncRefresh } from "@justkits/auth";
 *
 * function LoginPage() {
 *   const { broadcast } = useAuthSyncRefresh();
 *
 *   function handleLoginSuccess() {
 *    // 로그인 성공 처리 로직...
 *    broadcast("LOGIN_SUCCESS"); // 다른 탭에 로그인 성공 신호 전파
 *   }
 * }
 */
export function useAuthSyncRefresh() {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(AUTH_SYNC_CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent) => {
      if (event.data === "LOGIN_SUCCESS" || event.data === "LOGOUT") {
        // 인증 상태 변경 신호 수신 시, 페이지 강제 새로고침
        globalThis.window.location.reload();
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  // 인증 상태 변경 이벤트 브로드캐스트 함수
  const broadcast = useCallback((event: "LOGIN_SUCCESS" | "LOGOUT") => {
    channelRef.current?.postMessage(event);
  }, []);

  return { broadcast };
}
