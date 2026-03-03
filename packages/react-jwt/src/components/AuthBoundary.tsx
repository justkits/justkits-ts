import { ReactNode } from "react";

import { useAuth } from "../models/auth";

type Props = {
  children: ReactNode;
  fallback: ReactNode;
};

/**
 * 로그인해야만 접근할 수 있는 페이지들을 감싸는 래퍼 컴포넌트.
 * 로그인이 되어있지 않은 상태인 경우, fallback UI가 렌더링된다.
 */
export function AuthBoundary({ children, fallback }: Readonly<Props>) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
