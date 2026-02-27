import { AuthConfig, AuthConfigInput } from "./types";

let config: AuthConfig = {
  endpoints: {
    login: "/login/",
    logout: "/logout/",
    refresh: "/tokens/refresh/",
    me: "/me/",
  },
  selectors: {
    accessToken: (response) => response.data,
    user: (response) => response.data,
  },
  shouldRefresh: (err) => err.response?.status === 401,
  meQueryKey: ["me"],
  onSessionSync: {
    reloadOnLogin: false,
  },
  onRefreshFail: undefined,
};

export function setAuthConfig(input: AuthConfigInput) {
  config = {
    endpoints: { ...config.endpoints, ...input.endpoints },
    selectors: { ...config.selectors, ...input.selectors },
    shouldRefresh: input.shouldRefresh ?? config.shouldRefresh,
    meQueryKey: input.meQueryKey ?? config.meQueryKey,
    onSessionSync: {
      ...config.onSessionSync,
      ...input.onSessionSync,
    },
    onRefreshFail: input.onRefreshFail ?? config.onRefreshFail,
  };
}

export function getLoginConfig() {
  return {
    endpoint: config.endpoints.login,
    selector: config.selectors.accessToken,
  };
}

export function getLogoutConfig() {
  return {
    endpoint: config.endpoints.logout,
  };
}

export function getRefreshConfig() {
  return {
    endpoint: config.endpoints.refresh,
    selector: config.selectors.accessToken,
    shouldRefresh: config.shouldRefresh,
    onRefreshFail: config.onRefreshFail,
  };
}

export function getMeConfig() {
  return {
    endpoint: config.endpoints.me,
    selector: config.selectors.user,
    queryKey: config.meQueryKey,
  };
}

export function getSessionSyncCallbacks() {
  return config.onSessionSync;
}
