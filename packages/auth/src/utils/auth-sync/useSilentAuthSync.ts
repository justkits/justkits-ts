import { useCallback, useEffect, useRef } from "react";

import { AUTH_SYNC_CHANNEL_NAME, SilentAuthSyncConfig } from "./config";

/**
 * 다른 탭에서 인증 상태 변경이 감지되었을 때 인증 상태를 동기화하는 훅
 *  - 다른 탭에서 로그인에 성공하면, 넘겨받은 onLoginSuccess 콜백이 실행된다.
 *  - 다른 탭에서 로그아웃하면, 강제 새로고침을 수행한다.
 */
export function useSilentAuthSync({
  onLoginSuccess,
}: Readonly<SilentAuthSyncConfig>) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel(AUTH_SYNC_CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = async (event: MessageEvent) => {
      if (event.data === "LOGIN_SUCCESS") {
        // 다른 탭에서 로그인 성공 신호 수신 시, onLoginSuccess 실행
        await onLoginSuccess();
      } else if (event.data === "LOGOUT") {
        // 다른 탭에서 로그아웃 신호 수신 시, 페이지 강제 새로고침
        globalThis.window.location.reload();
      }
    };

    return () => {
      channel.close();
    };
  }, [onLoginSuccess]);

  // 인증 상태 변경 이벤트 브로드캐스트 함수
  const broadcast = useCallback((event: "LOGIN_SUCCESS" | "LOGOUT") => {
    channelRef.current?.postMessage(event);
  }, []);

  return { broadcast };
}
