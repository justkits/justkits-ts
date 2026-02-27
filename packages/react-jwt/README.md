# @justkits/react-jwt

React SPA 앱을 위한 Auth 라이브러리. 사이드 프로젝트를 진행하는데 있어, 반복적인 Auth 관련 코드를 매번 작성하는게 귀찮아서 공통 로직을 라이브러리화 해서 재사용하면 어떨까 하는 생각에 시작하게된 간단한 프로젝트다.

> **Note**: 본 라이브러리는 React SPA 앱에 적합한 Auth 라이브러리로, NextJS 등 SSR 환경에서는 사용하지 **않는** 것을 추천한다.

> **Peer Dependencies**: 본 라이브러리는 `axios`와 `tanstack query`를 사용하는 것을 기본으로 한다.

## Clarification

본 프로젝트에서는:

- **token refresh**는 토큰을 갱신하는 기능을 말하고
- **refresh token**은 리프레시 토큰 객체를 지칭한다.

---

## Architecture

| 토큰          | 스토리지                          |
| ------------- | --------------------------------- |
| Access Token  | In-memory                         |
| Refresh Token | `httpOnly` cookie (서버에서 관리) |

앱이 마운트 되면, `AuthProvider`가 초기 토큰 갱신(token refresh)을 시도한다. 성공한다면, 유저는 인증이 된 상태로 변경되고, 실패한다면 인증이 되지 않은 상태로 앱이 시작한다. 백엔드 서버는 `refresh token`을 로그인 시 쿠키로 설정하고, 로그아웃 시 삭제하도록 구현을 해야한다.

---

## Installation

본 패키지는 GitHub Package Registry에 배포되어 있다. 설치 전에 프로젝트 루트의 `.npmrc` 파일을 추가해서 패키지에 대한 액세스를 부여해야 한다.

```bash
pnpm add @justkits/react-jwt
```

### Peer Dependencies

```bash
pnpm add react axios @tanstack/react-query
```

---

## Quick Start

### 1. 타입 선언

앱 내부에 `*.d.ts` 파일을 만들어서 (위치는 상관없지만 루트에 두는걸 추천) `LoginCredentials`와 `UserType`를 선언한다.

#### 예시

```ts
// auth.d.ts
// 아래 예시는 zod를 사용하지만, 어떤 방식으로 타입을 정의해도 무방하다.
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type MyLoginCredentials = z.infer<typeof loginSchema>;

type MyUser = {
  id: number;
  email: string;
  name: string;
};

declare module "@justkits/react-jwt" {
  type LoginCredentials = MyLoginCredentials;
  type UserType = MyUser;
}
```

### 2. 래퍼 감싸기

`AuthProvider`를 앱 최상단 레벨에서 적용해서 앱을 감싸야 한다.

> **중요!**: `AuthProvider`는 반드시 `QueryClientProvider` 내부에 위치해야 한다. 잘못된 순서로 감싸면 에러가 발생한다.

> **중요!**: 전달할 axios 인스턴스에 `withCredentials` 옵션을 반드시 `true`로 설정해야 한다. 그러지 않으면, `refresh token`을 제대로 활용할 수 없다.

```tsx
// main.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@justkits/react-jwt";
import axios from "axios";

const queryClient = new QueryClient();

const axiosInstance = axios.create({
  baseURL: "https://api.example.com",
  withCredentials: true, // required for httpOnly cookie
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider instance={axiosInstance}>{/* your app */}</AuthProvider>
    </QueryClientProvider>
  );
}
```

---

## API Reference

### `<AuthProvider>`

루트 Provider로서, 세션 초기화, `axios`에 응답 인터셉터를 설치하여 토큰 자동 갱신 로직을 추가, 여러 탭간 상태 동기화를 위한 `BroadcastChannel` 세팅 등의 작업을 담당한다.

| Prop       | 타입              | 필수 여부 | 기본값                  | 설명                                                    |
| ---------- | ----------------- | :-------: | ----------------------- | ------------------------------------------------------- |
| `instance` | `AxiosInstance`   |    ✅     | —                       | 앱에서 사용할 axios instance                            |
| `children` | `ReactNode`       |    ✅     | —                       | 앱의 content                                            |
| `fallback` | `ReactNode`       |    ❌     | `<div>Loading...</div>` | 앱 초기화 중 보여줄 UI. 즉, 로딩 UI                     |
| `config`   | `AuthConfigInput` |    ❌     | 아래 참조               | 본 라이브러리의 여러 설정 값들. 자세한 내용은 아래 참고 |

> `instance`: 로그인 상태에서는, 자동으로 요청에 `access` 토큰을 담아서 요청하도록 설정되기 때문에, 이걸 원하지 않는 요청에는 여기에 담은 instance를 사용하면 안된다. 이런 경우가 있다면, instance를 2개를 만들어 하나만 `AuthProvider`에 전달하고, 적절하게 사용하는 것을 추천한다.

> `config`: 최초 마운트 시 한 번만 읽힌다. 마운트 이후 `config` prop이 변경되어도 반영되지 않으므로, 앱 초기화 시점에 정적으로 값을 전달해야 한다.

#### `config` 옵션

모든 필드는 필수가 아니며, 기본값들이 미리 정해져 있다. 따라서, override하고 싶은 값들만 정하면 된다.

| 옵션                          | 타입                               | 기본값                                  | 설명                                                                                                                                                                                                                                                               |
| ----------------------------- | ---------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `endpoints.login`             | `string`                           | `"/login/"`                             | 로그인 endpoint                                                                                                                                                                                                                                                    |
| `endpoints.logout`            | `string`                           | `"/logout/"`                            | 로그아웃 endpoint                                                                                                                                                                                                                                                  |
| `endpoints.refresh`           | `string`                           | `"/tokens/refresh/"`                    | 토큰 갱신 endpoint                                                                                                                                                                                                                                                 |
| `endpoints.me`                | `string`                           | `"/me/"`                                | 유저 정보 endpoint                                                                                                                                                                                                                                                 |
| `selectors.accessToken`       | `(res: AxiosResponse) => string`   | `(res) => res.data`                     | 로그인이나 토큰 갱신 API 응답에서 access token을 추출하는 함수                                                                                                                                                                                                     |
| `selectors.user`              | `(res: AxiosResponse) => UserType` | `(res) => res.data`                     | Me API 응답에서 User 객체를 추출하는 함수                                                                                                                                                                                                                          |
| `shouldRefresh`               | `(err: AxiosError) => boolean`     | `(err) => err.response?.status === 401` | 실패한 API 응답 중, 토큰 갱신이 필요한지 판단하는 함수                                                                                                                                                                                                             |
| `meQueryKey`                  | `string[]`                         | `["me"]`                                | Me API를 위한 TanStack 쿼리 키                                                                                                                                                                                                                                     |
| `onSessionSync.reloadOnLogin` | `boolean`                          | `false`                                 | 하나의 탭에서 로그인에 성공했을 때, 상태 동기화를 위해 열려있는 다른 탭에서 페이지 새로고침을 실행할지 여부. `onSessionSync.LOGIN_SUCCESS` 함수가 설정되어 있다면, 새로고침을 먼저 수행한 후 함수가 호출된다                                                       |
| `onSessionSync.LOGIN_SUCCESS` | `() => void \| Promise<void>`      | `undefined`                             | 다른 탭에서 로그인에 성공했을 때 호출할 콜백 함수. toast 메시지를 띄우는 등의 작업을 할 수 있다                                                                                                                                                                    |
| `onSessionSync.LOGOUT`        | `() => void \| Promise<void>`      | `undefined`                             | 다른 탭에서 로그아웃 했을 때 호출할 콜백 함수. 마찬가지로 toast 메시지를 띄우는 등의 작업을 할 수 있다                                                                                                                                                             |
| `onRefreshFail`               | `() => void \| Promise<void>`      | `undefined`                             | 토큰 갱신에 실패했을 때 호출할 콜백 함수. 상태 초기화 외에 실행할 작업을 담아서 전달하면 된다. onSessionSync의 콜백 옵션들과 같이 toast 메시지를 띄우는 등의 작업을 할 수 있다. [**중요**] 본 콜백 함수는 세션 초기화 시 토큰 갱신에 실패했을 때는 호출되지 않는다 |

### `useAuth()`

인증 상태와 액션들을 제공하는 훅이다. `AuthProvider`로 감싸져 있지 않으면 에러가 발생한다.

```ts
const { isAuthenticated, login, logout } = useAuth();
```

| 필드              | 타입                                           | 설명                                                                                                                                                         |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `isAuthenticated` | `boolean`                                      | 유저 인증 여부                                                                                                                                               |
| `login`           | `(payload: LoginCredentials) => Promise<void>` | 로그인 API 호출 함수. 성공 시 `access` 토큰을 저장하고, 다른 탭에 로그인 이벤트를 전파한다. 실패하면 오류를 호출한 모듈에서 처리할 수 있도록 그대로 넘겨준다 |
| `logout`          | `() => Promise<void>`                          | 로그아웃 API 호출 함수. 성공 여부와 무관하게 `access` 토큰을 삭제하고, 다른 탭에 로그아웃 이벤트를 전파한다                                                  |

### `useUser()`

현재 유저 데이터와 관련 액션을 제공하는 훅이다. `AuthProvider`로 감싸져 있지 않으면 에러가 발생한다.

유저 데이터는 TanStack Query를 통해 가져오며, `isAuthenticated`가 `true`일 때만 활성화된다. 로그아웃 시, 쿼리 캐시는 초기화된다.

```ts
const { user, refreshUser } = useUser();
```

| 필드          | 타입                  | 설명                                                                                         |
| ------------- | --------------------- | -------------------------------------------------------------------------------------------- |
| `user`        | `UserType \| null`    | 현재 유저 데이터. 인증된 유저가 없거나 Me API가 아직 응답을 받지 못한 경우 `null`을 반환한다 |
| `refreshUser` | `() => Promise<void>` | 수동으로 Me API 호출하여 유저 데이터를 갱신하고 싶을 때 사용하는 함수                        |

> 로그인 직후 `isAuthenticated`가 `true`로 바뀌더라도, Me API 응답이 오기 전까지는 `user`가 잠시 `null`일 수 있다. `user`를 사용하는 컴포넌트에서는 반드시 `null` 체크를 해야 한다.

### `<AuthBoundary>`

인증이 필요한 페이지를 감싸는 래퍼 컴포넌트. `fallback` 혹은 `onUnauthorized` **둘 중 하나만** 전달해야 한다. 둘 다 제공하는 경우 타입 오류가 발생한다.

```tsx
// Fallback UI를 제공하는 경우
<AuthBoundary fallback={<p>Please log in to view this page.</p>}>
  <ProtectedPage />
</AuthBoundary>

// onUnauthorized 콜백 함수를 제공하는 경우
<AuthBoundary onUnauthorized={() => router.navigate("/login")}>
  <ProtectedPage />
</AuthBoundary>
```

| Prop             | 타입                          | 설명                                                                                  |
| ---------------- | ----------------------------- | ------------------------------------------------------------------------------------- |
| `fallback`       | `ReactNode`                   | 로그인되어 있지 않은 경우 렌더링 되는 UI (예: "로그인이 필요한 서비스 입니다"를 표시) |
| `onUnauthorized` | `() => void \| Promise<void>` | 로그인되어 있지 않은 경우 호출되는 콜백 함수. (예: 로그인 페이지로 리디렉트)          |

> 리디렉트 도중 로딩 상태를 보여주는 렌더링을 하고 싶다면, 라우팅 라이브러리의 기능을 활용하는 것을 권장한다.

### `<GuestsOnly>`

`<AuthBoundary>`와 반대로 로그인 상태가 **아닌** 경우에만 접근할 수 있는 페이지를 감싸는 래퍼 컴포넌트. 로그인 페이지나, 회원가입 페이지 등에 적합하다. 로그인 상태인 유저가 접근할 시, `onAuthorized` 함수가 호출된다.

```tsx
<GuestsOnly onAuthorized={() => router.navigate("/dashboard")}>
  <LoginPage />
</GuestsOnly>
```

| Prop           | 타입                          | 설명                                              |
| -------------- | ----------------------------- | ------------------------------------------------- |
| `onAuthorized` | `() => void \| Promise<void>` | 로그인 상태인 유저가 접근할 시 호출되는 콜백 함수 |

> 로그인 상태인 경우, `children`은 렌더링되지 않는다 (`null` 반환). 리다이렉트가 완료되기 전까지 빈 화면이 잠깐 보일 수 있으며, 이 경우 라우팅 라이브러리의 로딩 상태를 활용하는 것을 권장한다.

---

## Examples

### Login

```tsx
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@justkits/react-jwt";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: login,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    try {
      await mutateAsync({
        email: form.get("email") as string,
        password: form.get("password") as string,
      });

      // 성공 후처리 (toast는 사용 중인 알림 라이브러리로 대체)
      navigate("/dashboard");
      toast.success("로그인에 성공하였습니다!");
    } catch (error) {
      // 여기서 에러를 처리할 수 있다.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" />
      <input name="password" type="password" />
      {error && <p>Login failed. Please try again.</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

### Logout

```tsx
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@justkits/react-jwt";

export function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    toast.success("로그아웃 처리 되었습니다!"); // toast는 사용 중인 알림 라이브러리로 대체
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

### User Info

```tsx
import { useUser } from "@justkits/react-jwt";

export function UserProfile() {
  const { user } = useUser();

  if (!user) return null;

  return <div>Welcome, {user.name}!</div>;
}
```

### Route Protection (TanStack Router 예시)

```tsx
import { useNavigate } from "@tanstack/react-router";
import { AuthBoundary, GuestsOnly } from "@justkits/react-jwt";

export function DashboardPage() {
  const navigate = useNavigate();
  return (
    <AuthBoundary onUnauthorized={() => navigate("/login")}>
      <Dashboard />
    </AuthBoundary>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  return (
    <GuestsOnly onAuthorized={() => navigate("/dashboard")}>
      <LoginForm />
    </GuestsOnly>
  );
}
```

### Custom Configs

```tsx
<AuthProvider
  instance={axiosInstance}
  fallback={<FullPageSpinner />}
  config={{
    endpoints: {
      login: "/api/auth/login",
      logout: "/api/auth/logout",
      refresh: "/api/auth/refresh",
      me: "/api/users/me",
    },
    selectors: {
      accessToken: (res) => res.data.accessToken,
      user: (res) => res.data.user,
    },
    shouldRefresh: (err) =>
      err.response?.status === 403 &&
      err.response?.data?.code === "TOKEN_EXPIRED",
    onRefreshFail: () => {
      toast.error("Your session has expired. Please log in again.");
    },
    onSessionSync: {
      reloadOnLogin: true,
      LOGIN_SUCCESS: () => toast.success("Logged in from another tab!"),
      LOGOUT: () => toast.info("Logged out from another tab."),
    },
  }}
>
  {children}
</AuthProvider>
```

---

## Cross-Tab Synchronization

본 라이브러리는 [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)를 활용하여 여러 탭간 인증 상태를 동기화한다.

> **참고**: `BroadcastChannel`은 모던 브라우저에서 지원된다. 지원되지 않는 환경에서는 크로스탭 동기화 기능이 자동으로 비활성화되며, 나머지 인증 기능은 정상적으로 동작한다.

| 이벤트                      | 다른 탭에서의 동작                                                                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 로그인 성공 (LOGIN_SUCCESS) | `reloadOnLogin: true` 상태면, 페이지가 새로고침을 수행하고, 그 뒤에 `LOGIN_SUCCESS` 콜백 함수가 실행된다. `reloadOnLogin: false` 상태면, `LOGIN_SUCCESS` 콜백 함수가 곧바로 실행된다. |
| 로그아웃 (LOGOUT)           | 로그아웃 이벤트에는 페이지가 무조건 새로고침된다. 그 후, `LOGOUT` 콜백 함수가 실행된다.                                                                                               |

---

## Known Issues

### React Strict Mode에서 세션 초기화 이중 실행

`initializeSession`은 `isReady` 가드를 갖고 있지만, cleanup 시 호출되는 `resetSession()`이 `isReady`를 `false`로 되돌린다. 따라서 React Strict Mode의 이중 마운트(mount → unmount → mount) 사이클에서 토큰 갱신 API가 두 번 호출된다. 개발 환경(Strict Mode)에서만 발생하는 문제이며, 프로덕션 빌드에는 영향 없다.

### 싱글턴 모듈 상태 — `AuthProvider` 다중 인스턴스 미지원

`/src/lib/`의 모듈들(`session.ts`, `axios.ts`, `broadcast-channel.ts`)과 `/src/configs/state.ts`는 모듈 수준의 전역 변수로 상태를 관리한다. 따라서 `AuthProvider`를 두 개 이상 마운트하거나 Microfrontend 환경에서 사용하면 상태가 공유·충돌된다. 본 라이브러리는 앱 내 `AuthProvider`가 단 하나인 환경을 전제로 설계되었다.

### 인터셉터 ID가 전역 단일 값으로 관리됨

`lib/axios.ts`의 `interceptorId`는 모듈 수준의 단일 변수다. `setupResponseInterceptor`가 서로 다른 axios 인스턴스로 두 번 호출되면, 두 번째 호출의 ID가 첫 번째를 덮어쓴다. 이후 첫 번째 인스턴스에 대해 `ejectInterceptor`를 호출해도 잘못된 ID로 eject를 시도하므로 인터셉터가 제거되지 않는다. 위의 `AuthProvider` 다중 인스턴스 미지원 이슈와 같은 맥락의 제약이다.

---

## Future Considerations

- Access 토큰의 exp를 파싱해서, 1분정도 전에 refresh를 스케줄링하는 로직 추가
- Token Refresh의 모든 실패 케이스를 똑같이 처리하는데, 이걸 구체화 하는 전략
  - 가령, 네트워크 연결 상태 불량으로 인한 token refresh 실패는 유저가 오프라인이어서 실패하는 것과 다르게 처리할 수 있다.
- Me API에 대한 쿼리 옵션을 개발자가 직접 설정할 수 있도록 옵션을 제공할 수 있다.
  - 지금 현재는, queryClient의 기본 옵션값대로 처리하고 있다.
- isLoading, isError 등 Me API 상태를 useUser() 훅에 제공한다.

---

## License

[LICENSE](./LICENSE) 파일 참조.
