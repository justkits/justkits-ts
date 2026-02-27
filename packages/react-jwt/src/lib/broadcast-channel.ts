import { getSessionSyncCallbacks } from "../configs/state";

const AUTH_SYNC_CHANNEL_NAME = "@justkits/react-jwt";
type AuthEventType = "LOGIN_SUCCESS" | "LOGOUT";

let authChannel: BroadcastChannel | null = null;

export function initializeAuthChannel() {
  if (typeof BroadcastChannel === "undefined") return;

  authChannel ??= new BroadcastChannel(AUTH_SYNC_CHANNEL_NAME);

  authChannel.onmessage = (event: MessageEvent) => {
    const config = getSessionSyncCallbacks();
    if (event.data === "LOGIN_SUCCESS") {
      if (config.reloadOnLogin) {
        sessionStorage.setItem(AUTH_SYNC_CHANNEL_NAME, "LOGIN_SUCCESS");
        globalThis.window.location.reload();
      } else {
        config.LOGIN_SUCCESS?.();
      }
    } else if (event.data === "LOGOUT") {
      sessionStorage.setItem(AUTH_SYNC_CHANNEL_NAME, "LOGOUT");
      globalThis.window.location.reload();
    }
  };

  // 초기에 sessionStorage에 저장된 이벤트를 확인해서, 다른 탭에서 이미 로그인/로그아웃이 된 상태라면 그에 맞게 초기화한다
  const flag = sessionStorage.getItem(AUTH_SYNC_CHANNEL_NAME);
  const config = getSessionSyncCallbacks();
  if (flag === "LOGIN_SUCCESS") {
    config.LOGIN_SUCCESS?.();
  } else if (flag === "LOGOUT") {
    config.LOGOUT?.();
  }
  sessionStorage.removeItem(AUTH_SYNC_CHANNEL_NAME);
}

export function closeAuthChannel() {
  authChannel?.close();
  authChannel = null;
}

export function broadcast(event: AuthEventType) {
  authChannel?.postMessage(event);
}
