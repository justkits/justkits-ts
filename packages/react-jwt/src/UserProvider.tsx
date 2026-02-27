import { ReactNode, useCallback, useMemo } from "react";
import { AxiosInstance } from "axios";
import { useQuery } from "@tanstack/react-query";

import { meAPI } from "./api/me";
import { getMeConfig } from "./configs/state";
import { useAuth } from "./models/auth";
import { UserContext, UserType } from "./models/user";

interface Props {
  children: ReactNode;
  instance: AxiosInstance;
}

export function UserProvider({ children, instance }: Readonly<Props>) {
  const { isAuthenticated } = useAuth();
  const config = getMeConfig();

  const { data, refetch } = useQuery<UserType>({
    queryKey: config.queryKey,
    queryFn: () => meAPI(instance),
    enabled: isAuthenticated,
  });

  const refreshUser = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const value = useMemo(() => {
    return { user: data ?? null, refreshUser };
  }, [data, refreshUser]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
