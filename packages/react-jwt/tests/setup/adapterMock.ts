import {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

/** null = network error (no response object) */
type RouteEntry = { status: number; data?: unknown } | null;

/**
 * Creates a mock axios adapter that sits inside the interceptor chain.
 *
 * Each route key is `"METHOD /url"`. Values are either a single entry or an
 * array consumed as a queue — the last entry repeats once the queue is empty.
 *
 * @example
 * testInstance.defaults.adapter = createAdapterMock({
 *   "POST /tokens/refresh/": [
 *     { status: 200, data: "initial-token" },
 *     { status: 200, data: "renewed-token" },
 *   ],
 *   "GET /me/": [
 *     { status: 401, data: "Token expired" },
 *     { status: 200, data: { id: 1, name: "Test User" } },
 *   ],
 * });
 */
export function createAdapterMock(
  routes: Record<string, RouteEntry | RouteEntry[]>,
) {
  const queues = new Map<string, RouteEntry[]>(
    Object.entries(routes).map(([key, val]) => [
      key,
      Array.isArray(val) ? [...val] : [val],
    ]),
  );

  return async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    const key = `${config.method!.toUpperCase()} ${config.url}`;
    const queue = queues.get(key);

    if (!queue?.length) {
      throw new Error(`[adapterMock] Unmocked request: ${key}`);
    }

    // Consume the first entry; if only one remains, keep returning it
    const entry = queue.length > 1 ? queue.shift()! : queue[0];

    if (entry === null) {
      throw new AxiosError(
        "Network Error",
        AxiosError.ERR_NETWORK,
        config,
        null,
        undefined,
      );
    }

    if (entry.status >= 400) {
      throw new AxiosError(
        String(entry.status),
        AxiosError.ERR_BAD_RESPONSE,
        config,
        null,
        {
          status: entry.status,
          statusText: "Error",
          data: entry.data,
          headers: {},
          config,
        },
      );
    }

    return {
      status: entry.status,
      statusText: "OK",
      data: entry.data,
      headers: {},
      config,
    };
  };
}
