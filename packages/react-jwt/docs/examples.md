# Examples

## Login

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

## Logout

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

## User Info

```tsx
import { useUser } from "@justkits/react-jwt";

export function UserProfile() {
  const { user } = useUser();

  if (!user) return null;

  return <div>Welcome, {user.name}!</div>;
}
```

## Custom Configs

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
