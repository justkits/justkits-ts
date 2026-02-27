import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { AxiosInstance } from "axios";
import { useQueryClient } from "@tanstack/react-query";

import { loginAPI } from "./api/login";
import { logoutAPI } from "./api/logout";
import { AuthConfigInput } from "./configs/types";
import { useAuthConfig } from "./configs/useAuthConfig";
import { ejectInterceptor, setupResponseInterceptor } from "./lib/axios";
import {
  closeAuthChannel,
  initializeAuthChannel,
} from "./lib/broadcast-channel";
import {
  getSnapshot,
  initializeSession,
  resetSession,
  subscribe,
} from "./lib/session";
import { AuthContext } from "./models/auth";
import { LoginCredentials } from "./models/login";
import { UserProvider } from "./UserProvider";

interface Props {
  children: ReactNode;
  instance: AxiosInstance;
  fallback?: ReactNode; // 초기화 중 보여줄 UI (예: 로딩 스피너)
  config?: AuthConfigInput;
}

export function AuthProvider({
  children,
  instance,
  fallback,
  config = {},
}: Readonly<Props>) {
  const { isReady, isAuthenticated } = useSyncExternalStore(
    subscribe,
    getSnapshot,
  );
  const queryClient = useQueryClient();
  useAuthConfig(config);

  useEffect(() => {
    setupResponseInterceptor(instance);
    initializeSession(instance);

    return () => {
      resetSession();
      ejectInterceptor(instance);
    };
  }, [instance]);

  useEffect(() => {
    initializeAuthChannel();

    return () => closeAuthChannel();
  }, []);

  const login = useCallback(
    async (payload: LoginCredentials) => {
      await loginAPI(instance, payload);
    },
    [instance],
  );

  const logout = useCallback(async () => {
    await logoutAPI(instance);
  }, [instance]);

  const contextValue = useMemo(
    () => ({
      isAuthenticated: isAuthenticated,
      login,
      logout,
    }),
    [isAuthenticated, login, logout],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      queryClient.clear();
    }
  }, [isAuthenticated, queryClient]);

  if (!isReady) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      <UserProvider instance={instance}>{children}</UserProvider>
    </AuthContext.Provider>
  );
}
