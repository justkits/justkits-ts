import { createContext, useContext } from "react";

export interface UserType {} // eslint-disable-line @typescript-eslint/no-empty-object-type

type UserState = {
  user: UserType | null;
  refreshUser: () => Promise<void>;
};

export const UserContext = createContext<UserState | null>(null);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
