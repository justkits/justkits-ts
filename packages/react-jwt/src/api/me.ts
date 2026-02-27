import { AxiosInstance } from "axios";

import { getMeConfig } from "../configs/state";
import { UserType } from "../models/user";

export async function meAPI(instance: AxiosInstance): Promise<UserType> {
  const config = getMeConfig();
  const res = await instance.get(config.endpoint);
  return config.selector(res);
}
