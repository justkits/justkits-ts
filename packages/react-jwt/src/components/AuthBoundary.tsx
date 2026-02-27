import { ReactNode, useEffect, useLayoutEffect, useRef } from "react";

import { useAuth } from "../models/auth";

type Props = {
  children: ReactNode;
} & (
  | { fallback: ReactNode; onUnauthorized?: never }
  | { fallback?: never; onUnauthorized: () => void | Promise<void> }
);

/**
 * 로그인해야만 접근할 수 있는 페이지들을 감싸는 래퍼 컴포넌트.
 * 로그인이 되어있지 않은 상태인 경우, 아래 두 가지 중 하나만 제공해야 한다:
 *  - `fallback`: 인증되지 않은 경우 렌더링할 UI.
 *  - `onUnauthorized`: 리다이렉트를 처리하는 콜백 (예: `router.navigate("/login")`).
 *
 * 두 props를 동시에 사용하는 것은 지원하지 않는다. 리다이렉트 중 전환 UI가 필요한 경우,
 * `onUnauthorized`로 네비게이션을 처리하고 라우터 자체의 로딩 상태를 활용하는 것을 권장한다.
 */
export function AuthBoundary({
  children,
  fallback,
  onUnauthorized,
}: Readonly<Props>) {
  const { isAuthenticated } = useAuth();
  const onUnauthorizedRef = useRef(onUnauthorized);
  useLayoutEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
  });

  useEffect(() => {
    if (!isAuthenticated && onUnauthorizedRef.current) {
      (async () => {
        await onUnauthorizedRef.current!();
      })();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
