import type { AxiosInstance } from "axios";

interface CommonOptions {
  /**
   * 갱신에 성공했을 때 처리할 콜백 함수
   */
  onSuccess?: (newToken: string) => void;
  /**
   * 갱신에 실패했을 때 처리할 콜백 함수
   */
  onError?: (error: unknown) => void;
}

export type FromFnOptions = {
  fn: () => Promise<string>;
} & CommonOptions;

export type FromConfigOptions = {
  instance: AxiosInstance;
  endpoint?: string;
  accessTokenVarName?: string;
} & CommonOptions;
