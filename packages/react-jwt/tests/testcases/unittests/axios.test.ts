import axios from "axios";

import { ejectInterceptor, setupResponseInterceptor } from "@/lib/axios";

describe("axios corner cases", () => {
  it("does nothing when called before setupResponseInterceptor (interceptorId is null)", () => {
    const testInstance = axios.create();
    const ejectSpy = vi.spyOn(testInstance.interceptors.response, "eject");

    // interceptorId is null at module init — should not call eject
    ejectInterceptor(testInstance);

    expect(ejectSpy).not.toHaveBeenCalled();
  });

  it("ejects the interceptor when called after setupResponseInterceptor", () => {
    const testInstance = axios.create();
    const ejectSpy = vi.spyOn(testInstance.interceptors.response, "eject");

    setupResponseInterceptor(testInstance);
    ejectInterceptor(testInstance);

    expect(ejectSpy).toHaveBeenCalledTimes(1);
  });
});
