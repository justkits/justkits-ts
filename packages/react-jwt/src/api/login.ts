import { AxiosInstance } from "axios";

import { getLoginConfig } from "../configs/state";
import { setAuthHeader } from "../lib/axios";
import { broadcast } from "../lib/broadcast-channel";
import { updateSession } from "../lib/session";
import { LoginCredentials } from "../models/login";

export async function loginAPI(
  instance: AxiosInstance,
  payload: LoginCredentials,
  onSuccess?: () => void | Promise<void>, // example: router.navigate("/dashboard")
) {
  // 로그인 API 호출
  // 로그인은 실패하면 호출한 곳에서 에러 처리를 할 수 있어야하기 때문에, 여기서 try-catch로 감싸지 않고 에러를 그대로 던진다
  const config = getLoginConfig();

  const res = await instance.post(config.endpoint, payload);
  const token = config.selector(res);
  setAuthHeader(instance, token);
  broadcast("LOGIN_SUCCESS");
  updateSession(true);
  await onSuccess?.();
}
