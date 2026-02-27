import { useEffect, useRef } from "react";

import { AuthConfigInput } from "./types";
import { setAuthConfig } from "./state";

export function useAuthConfig(config: AuthConfigInput) {
  const configRef = useRef(config);

  useEffect(() => {
    setAuthConfig(configRef.current);
  }, []);
}
