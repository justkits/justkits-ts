import { createContext, useContext } from "react";

import { AuthEventType } from "../utils";

interface AuthContextValue {
  isAuthenticated: boolean;
  setAuthState: (token: string) => void;
  clearAuthState: () => void;
  broadcast: (event: AuthEventType) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
