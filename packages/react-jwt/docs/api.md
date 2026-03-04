# API Reference

## `<AuthProvider>`

루트 Provider로서, 세션 초기화, `axios`에 응답 인터셉터를 설치하여 토큰 자동 갱신 로직을 추가, 여러 탭간 상태 동기화를 위한 `BroadcastChannel` 세팅 등의 작업을 담당한다.

| Prop       | 타입              | 필수 여부 | 기본값                  | 설명                                                    |
| ---------- | ----------------- | :-------: | ----------------------- | ------------------------------------------------------- |
| `instance` | `AxiosInstance`   |    ✅     | —                       | 앱에서 사용할 axios instance                            |
| `children` | `ReactNode`       |    ✅     | —                       | 앱의 content                                            |
| `fallback` | `ReactNode`       |    ❌     | `<div>Loading...</div>` | 앱 초기화 중 보여줄 UI. 즉, 로딩 UI                     |
| `config`   | `AuthConfigInput` |    ❌     | 아래 참조               | 본 라이브러리의 여러 설정 값들. 자세한 내용은 아래 참고 |

> `instance`: 로그인 상태에서는, 자동으로 요청에 `access` 토큰을 담아서 요청하도록 설정되기 때문에, 이걸 원하지 않는 요청에는 여기에 담은 instance를 사용하면 안된다. 이런 경우가 있다면, instance를 2개를 만들어 하나만 `AuthProvider`에 전달하고, 적절하게 사용하는 것을 추천한다.

> `config`: 최초 마운트 시 한 번만 읽힌다. 마운트 이후 `config` prop이 변경되어도 반영되지 않으므로, 앱 초기화 시점에 정적으로 값을 전달해야 한다.

### `config` 옵션

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

---

## `useAuth()`

인증 상태와 액션들을 제공하는 훅이다. `AuthProvider`로 감싸져 있지 않으면 에러가 발생한다.

```ts
const { isAuthenticated, login, logout } = useAuth();
```

| 필드              | 타입                                           | 설명                                                                                                                                                         |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `isAuthenticated` | `boolean`                                      | 유저 인증 여부                                                                                                                                               |
| `login`           | `(payload: LoginCredentials) => Promise<void>` | 로그인 API 호출 함수. 성공 시 `access` 토큰을 저장하고, 다른 탭에 로그인 이벤트를 전파한다. 실패하면 오류를 호출한 모듈에서 처리할 수 있도록 그대로 넘겨준다 |
| `logout`          | `() => Promise<void>`                          | 로그아웃 API 호출 함수. 성공 여부와 무관하게 `access` 토큰을 삭제하고, 다른 탭에 로그아웃 이벤트를 전파한다                                                  |

---

## `useUser()`

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
