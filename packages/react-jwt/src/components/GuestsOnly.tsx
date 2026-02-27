import { ReactNode, useEffect, useLayoutEffect, useRef } from "react";

import { useAuth } from "../models/auth";

type Props = {
  children: ReactNode;
  onAuthorized: () => void | Promise<void>;
};

/**
 * 비로그인 사용자만 접근할 수 있는 페이지를 감싸는 래퍼 컴포넌트 (예: 로그인, 회원가입 페이지).
 * 로그인된 사용자가 접근할 경우, `onAuthorized` 콜백이 호출된다.
 * `onAuthorized`에는 다른 페이지로의 리다이렉트를 전달하는 것을 강력하게 추천한다. (예: `router.navigate("/dashboard")`).
 */
export function GuestsOnly({ children, onAuthorized }: Readonly<Props>) {
  const { isAuthenticated } = useAuth();
  const onAuthorizedRef = useRef(onAuthorized);
  useLayoutEffect(() => {
    onAuthorizedRef.current = onAuthorized;
  });

  useEffect(() => {
    if (isAuthenticated) {
      (async () => {
        await onAuthorizedRef.current();
      })();
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
