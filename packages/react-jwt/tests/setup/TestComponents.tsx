import { useState } from "react";
import { AxiosInstance } from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  AuthBoundary,
  AuthProvider,
  GuestsOnly,
  useAuth,
  useUser,
} from "@/index";
import { AuthConfigInput } from "@/configs/types";

function TestLoading() {
  return <div>Loading Fallback</div>;
}

function TestLoginPage() {
  const [err, setErr] = useState<boolean>(false);
  const { login } = useAuth();

  const onAuthorized = vi.fn();

  const handleLogin = async () => {
    try {
      await login({ email: "test@example.com", password: "password" });
      setErr(false);
    } catch (error) {
      console.error("Login failed:", error);
      setErr(true);
    }
  };

  return (
    <GuestsOnly onAuthorized={onAuthorized}>
      <h1>Login Form</h1>
      <button onClick={handleLogin}>Login</button>
      {err && <p>Login Failed</p>}
    </GuestsOnly>
  );
}

function TestAuthOnly() {
  return <div>Guests Are Not Allowed</div>;
}

function TestDashboardPage() {
  const { logout } = useAuth();
  const { user, refreshUser } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthBoundary fallback={<TestAuthOnly />}>
      <h1>Dashboard</h1>
      {/* @ts-expect-error 유저 타입을 테스트 환경에서만 정의함. */}
      {user?.name && <p>{user.name}</p>}
      <button onClick={refreshUser}>Refetch User</button>
      <button onClick={handleLogout}>Logout</button>
    </AuthBoundary>
  );
}

export function TestComponent({
  instance,
  config,
}: Readonly<{
  instance: AxiosInstance;
  config?: AuthConfigInput;
}>) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        instance={instance}
        fallback={<TestLoading />}
        config={config}
      >
        <TestDashboardPage />
        <TestLoginPage />
      </AuthProvider>
    </QueryClientProvider>
  );
}
