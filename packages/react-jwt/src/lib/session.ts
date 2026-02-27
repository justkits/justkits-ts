import { AxiosInstance } from "axios";

import { tokenRefreshAPI } from "../api/tokenRefresh";

type AuthState = {
  isAuthenticated: boolean;
  isReady: boolean;
};

let state: AuthState = {
  isAuthenticated: false,
  isReady: false,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function initializeSession(instance: AxiosInstance) {
  if (state.isReady) {
    return;
  }
  // 앱 부팅 시 refresh 시도
  (async () => {
    let isAuthenticated = false;
    try {
      await tokenRefreshAPI(instance);
      isAuthenticated = true;
    } catch {
      // token refresh failed — app starts unauthenticated
    } finally {
      state = { isAuthenticated, isReady: true };
      notify();
    }
  })();
}

export function updateSession(authenticated: boolean) {
  if (state.isAuthenticated !== authenticated) {
    // state.isAuthenticated = true로 직접 수정하지 않고,
    // 새로운 참조를 생성하여, React가 상태 변화를 정확하게 감지할 수 있도록 한다.
    state = { ...state, isAuthenticated: authenticated };
    notify();
  }
}

export function resetSession() {
  state = { isAuthenticated: false, isReady: false };
  notify();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return state;
}
