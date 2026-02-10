import { useCallback, useMemo, useState } from "react";

export function useAccessToken() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const clearToken = useCallback(() => {
    setAccessToken(null);
  }, []);

  const updateToken = useCallback((token: string) => {
    setAccessToken(token);
  }, []);

  const isAuthenticated = useMemo(() => !!accessToken, [accessToken]);

  return { isAuthenticated, clearToken, updateToken };
}
