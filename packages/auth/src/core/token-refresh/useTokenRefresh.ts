import { FromConfigOptions, FromFnOptions } from "./config";

/**
 * 기본 설정값들을 변수로 받아 토큰 리프레시 로직을 제공하는 훅
 * @returns tokenRefresh 함수
 */
export function useTokenRefreshFromConfig({
  instance,
  endpoint = "/auth/refresh/",
  accessTokenVarName = "accessToken",
  onSuccess,
  onError,
}: Readonly<FromConfigOptions>) {
  const tokenRefreshFn = async () => {
    try {
      const response = await instance.post(endpoint);
      const newToken = response.data[accessTokenVarName];

      onSuccess?.(newToken);
    } catch (error) {
      onError?.(error);
    }
  };

  return { tokenRefreshFn };
}

/**
 * 단순 API 호출 함수를 받아 구체적인 토큰 리프레시 로직을 제공하는 훅
 * @returns tokenRefresh 함수
 */
export function useTokenRefreshFromFn({
  fn,
  onSuccess,
  onError,
}: Readonly<FromFnOptions>) {
  const tokenRefreshFn = async () => {
    try {
      const newToken = await fn();

      onSuccess?.(newToken);
    } catch (error) {
      onError?.(error);
    }
  };

  return { tokenRefreshFn };
}
