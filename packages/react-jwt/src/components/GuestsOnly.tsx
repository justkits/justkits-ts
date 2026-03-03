import { ReactNode } from "react";

import { useAuth } from "../models/auth";

type Props = {
  children: ReactNode;
  fallback: ReactNode;
};

/**
 * 비로그인 사용자만 접근할 수 있는 페이지를 감싸는 래퍼 컴포넌트 (예: 로그인, 회원가입 페이지).
 * 로그인된 사용자가 접근할 경우, fallback UI가 렌더링된다.
 */
export function GuestsOnly({ children, fallback }: Readonly<Props>) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
