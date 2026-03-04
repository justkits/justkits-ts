# Guides

## Route Protection

본 라이브러리는 별도의 가드 컴포넌트를 제공하지 않는다. 접근 제어 방식(리다이렉트, 알림, fallback UI 등)은 앱마다 요구사항이 다르고, 사용하는 라우터에 따라 구현 방식도 달라지기 때문이다. `useAuth()`가 제공하는 `isAuthenticated`를 활용해 앱에 맞는 방식으로 직접 구현하는 것을 권장한다.

### TanStack Router — `beforeLoad` (권장)

`beforeLoad`는 라우트로의 **네비게이션 시점**에 단 한 번 실행된다. 인증 상태 변화에 반응하는 것이 아니라 실제 접근 시도를 가로채기 때문에, 리다이렉트와 알림을 안전하게 처리할 수 있다.

```ts
// router.ts
import { createRouter } from "@tanstack/react-router";
import { useAuth } from "@justkits/react-jwt";

// 라우터 생성 시 인증 컨텍스트를 주입한다
const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // AuthProvider 마운트 후 채워진다
  },
});

// App.tsx
export function App() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}
```

```tsx
// routes/dashboard.tsx — 인증이 필요한 라우트
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      toast.error("로그인이 필요한 서비스입니다.");
      throw redirect({ to: "/login" });
    }
  },
  component: DashboardPage,
});

// routes/login.tsx — 비로그인 사용자 전용 라우트
export const Route = createFileRoute("/login")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LoginPage,
});
```

`beforeLoad`에서 `context.auth`에 접근하는 방법에 대한 자세한 내용은 [TanStack Router 공식 문서](https://tanstack.com/router/latest/docs/framework/react/guide/router-context)를 참고.

### React Router — Layout Route

React Router에서는 레이아웃 라우트를 가드로 활용하는 것이 일반적인 패턴이다. `Outlet`을 렌더링하는 레이아웃 컴포넌트에서 인증 여부를 확인하고, 미인증 시 `<Navigate>`로 리다이렉트한다.

```tsx
// ProtectedLayout.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@justkits/react-jwt";

export function ProtectedLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// GuestLayout.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@justkits/react-jwt";

export function GuestLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
```

```tsx
// router.tsx
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    element: <ProtectedLayout />,
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
  {
    element: <GuestLayout />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
]);
```

단, 이 방식은 **네비게이션 시점이 아닌 렌더링 시점에 리다이렉트**하므로, 알림(toast, alert 등)을 레이아웃 컴포넌트 안에서 처리하면 로그인·로그아웃 직후에도 의도치 않게 실행될 수 있다. 알림이 필요한 경우에는 리다이렉트 대상 페이지에서 `location.state`를 읽어 처리하는 방식을 권장한다.

```tsx
// ProtectedLayout.tsx — state를 통해 리다이렉트 이유 전달
if (!isAuthenticated) {
  return <Navigate to="/login" replace state={{ reason: "unauthorized" }} />;
}

// LoginPage.tsx — 리다이렉트 이유를 읽어 알림 처리
import { useLocation } from "react-router-dom";

export function LoginPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.reason === "unauthorized") {
      toast.error("로그인이 필요한 서비스입니다.");
    }
  }, []);

  // ...
}
```
