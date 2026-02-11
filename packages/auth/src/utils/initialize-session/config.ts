export type SessionInitConfig = {
  tokenRefreshFn: () => Promise<string>;
  setAuthState: (token: string) => Promise<void> | void;
};
