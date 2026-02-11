import { useEffect } from "react";
import { useAuth } from "./useAuth";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUnauthorized?: () => void;
}

export function ProtectedRoute({
  children,
  fallback,
  onUnauthorized,
}: Readonly<Props>) {
  // fallback UI 혹은 onUnauthorized 둘 중 하나는 반드시 제공되어야 한다.
  if (!fallback && !onUnauthorized) {
    throw new Error(
      "ProtectedRoute requires either a fallback UI or an onUnauthorized handler.",
    );
  }

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
