import { createContext, useContext } from "react";

import { LoginCredentials } from "./login";

type AuthState = {
  isAuthenticated: boolean;
  login: (
    payload: LoginCredentials,
    onLoginSuccess?: () => void | Promise<void>,
  ) => Promise<void>;
  logout: (onLogout?: () => void | Promise<void>) => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
