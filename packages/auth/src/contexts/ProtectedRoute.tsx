import { useEffect } from "react";
import { useAuth } from "./useAuth";

type Props = {
  children: React.ReactNode;
} & (
  | { fallback: React.ReactNode; onUnauthorized?: () => void }
  | { fallback?: React.ReactNode; onUnauthorized: () => void }
);

export function ProtectedRoute({
  children,
  fallback,
  onUnauthorized,
}: Readonly<Props>) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && onUnauthorized) {
      onUnauthorized();
    }
  }, [isAuthenticated, onUnauthorized]);

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
