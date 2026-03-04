# @justkits/react-jwt

React SPA 앱을 위한 Auth 라이브러리. 사이드 프로젝트를 진행하는데 있어, 반복적인 Auth 관련 코드를 매번 작성하는게 귀찮아서 공통 로직을 라이브러리화 해서 재사용하면 어떨까 하는 생각에 시작하게된 간단한 프로젝트다.

> **Note**: 본 라이브러리는 React SPA 앱에 적합한 Auth 라이브러리로, NextJS 등 SSR 환경에서는 사용하지 **않는** 것을 추천한다.

> **Peer Dependencies**: 본 라이브러리는 `axios`와 `tanstack query`를 사용하는 것을 기본으로 한다.

## Clarification

본 프로젝트에서는:

- **token refresh**는 토큰을 갱신하는 기능을 말하고
- **refresh token**은 리프레시 토큰 객체를 지칭한다.

---

## Key Features

- **앱 시작 시 자동 로그인 복원** — `AuthProvider` 마운트 시 token refresh를 시도하여 이전 세션을 자동으로 복원한다. 성공하면 인증 상태로, 실패하면 비인증 상태로 앱이 시작된다.
- **만료 시 자동 토큰 갱신** — axios 응답 인터셉터를 통해 API 요청이 401로 실패하면 자동으로 token refresh를 시도하고 원래 요청을 재시도한다.
- **크로스탭 동기화** — [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)를 활용하여 여러 탭간 로그인·로그아웃 상태를 동기화한다. 모던 브라우저에서만 지원되며, 미지원 환경에서는 자동으로 비활성화된다.
- **`useAuth()` / `useUser()` 훅** — 인증 상태(`isAuthenticated`), 로그인·로그아웃 액션, 유저 데이터(`user`)에 컴포넌트 어디서든 간단하게 접근할 수 있다.

---

## Architecture

| 토큰          | 스토리지                          |
| ------------- | --------------------------------- |
| Access Token  | In-memory                         |
| Refresh Token | `httpOnly` cookie (서버에서 관리) |

백엔드 서버는 `refresh token`을 로그인 시 쿠키로 설정하고, 로그아웃 시 삭제하도록 구현을 해야한다.

---

## Installation

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

```ts
// auth.d.ts
declare module "@justkits/react-jwt" {
  interface LoginCredentials {
    email: string;
    password: string;
  }
  interface UserType {
    id: number;
    email: string;
    name: string;
  }
}
```

### 2. 래퍼 감싸기

`AuthProvider`를 앱 최상단 레벨에서 적용해서 앱을 감싸야 한다.

> **중요!**: `AuthProvider`는 반드시 `QueryClientProvider` 내부에 위치해야 한다.

> **중요!**: 전달할 axios 인스턴스에 `withCredentials: true`를 반드시 설정해야 한다.

```tsx
// main.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@justkits/react-jwt";
import axios from "axios";

const queryClient = new QueryClient();

const axiosInstance = axios.create({
  baseURL: "https://api.example.com",
  withCredentials: true,
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

## Guides

- [Route Protection](./docs/guides.md) — 접근 제어 구현 방법 및 TanStack Router `beforeLoad` 가이드

---

## Documentation

| 문서                           | 내용                                               |
| ------------------------------ | -------------------------------------------------- |
| [API Reference](./docs/api.md) | `AuthProvider`, `useAuth()`, `useUser()` 상세 설명 |
| [Examples](./docs/examples.md) | 로그인, 로그아웃, 유저 정보, 커스텀 설정 예시      |

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
- isLoading, isError 등 Me API 상태를 useUser() 훅에 제공한다.
- Guides Document에 내용 추가 (세션 만료 처리 Guide (onRefreshFail), 여러 axios 인스턴스 사용, 로그인 후 원래 페이지로 돌아가기, 크로스탭 동기화, shouldRefresh 커스터마이징 등)

---

## License

[LICENSE](./LICENSE) 파일 참조.
