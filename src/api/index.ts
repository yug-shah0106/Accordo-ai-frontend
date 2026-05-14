import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import { tokenStorage } from "../utils/tokenStorage";
import { env } from "../utils/env";
import { normalizeViteBackendUrl } from "../utils/normalizeViteBackendUrl";

const buildBaseUrl = (): string => {
  const rawBaseUrl = normalizeViteBackendUrl(env("VITE_BACKEND_URL") || "");
  if (!rawBaseUrl) {
    return "/api";
  }

  const withoutTrailingSlash = rawBaseUrl.replace(/\/+$/, "");

  if (withoutTrailingSlash.endsWith("/api")) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/api`;
};

const withApiPrefix = buildBaseUrl();

const api = axios.create({
  baseURL: withApiPrefix,
});
export default api;

export const authApi: AxiosInstance = axios.create({
  baseURL: withApiPrefix,
});

export const authMultiFormApi: AxiosInstance = axios.create({
  baseURL: withApiPrefix,
});

/**
 * Generate a short-ish UUID for cross-service request correlation.
 * Browser crypto.randomUUID is available everywhere we ship (>= Safari 15.4).
 */
const newRequestId = (): string => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  // Fallback for very old browsers
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const setAuthHeader = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  // Attach a fresh request id so backend + auth logs can be correlated.
  // If something upstream already set it (rare), preserve it.
  if (!config.headers["x-request-id"]) {
    config.headers["x-request-id"] = newRequestId();
  }

  const storedToken = tokenStorage.getAccessToken();
  if (!storedToken) {
    return config;
  }

  const token = storedToken.trim();
  config.headers.Authorization = token.startsWith("Bearer ")
    ? token
    : `Bearer ${token}`;

  return config;
};

// Request interceptors - Add access token to all requests
authApi.interceptors.request.use(setAuthHeader, (error: AxiosError) =>
  Promise.reject(error),
);

authMultiFormApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    config.headers["content-type"] = "multipart/form-data";
    return setAuthHeader(config);
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response interceptors - Handle token refresh
let isRefreshing = false;

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

let failedQueue: QueuedRequest[] = [];
// Once we've decided to redirect to /auth (refresh failed or no refresh token),
// further 401s should short-circuit instead of looping through refresh again.
let sessionExpired = false;

const processQueue = (error: any = null, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
};

const expireSession = (error: unknown): Promise<never> => {
  sessionExpired = true;
  processQueue(error, null);
  tokenStorage.clearTokens();
  if (typeof window !== "undefined" && window.location.pathname !== "/auth") {
    window.location.replace("/auth");
  }
  return Promise.reject(error);
};

const createResponseInterceptor = (instance: AxiosInstance): void => {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Once a session has been declared expired, every further 401 short-circuits.
      // Without this guard, components mounted on the page can keep firing requests
      // after window.location.replace() starts navigating, looping the interceptor.
      if (sessionExpired && error.response?.status === 401) {
        return Promise.reject(error);
      }

      // Check if error is 401 and we haven't already retried
      // Also exclude refresh token endpoint to prevent infinite loop
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("/auth/refresh-token")
      ) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token: string) => {
              originalRequest.headers.Authorization = token;
              return instance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        isRefreshing = true;
        originalRequest._retry = true;

        try {
          const refreshToken = tokenStorage.getRefreshToken();

          if (!refreshToken) {
            return expireSession(error);
          }

          // Call refresh token endpoint
          const refreshResponse = await axios.post<{
            data?: { accessToken: string };
            accessToken?: string;
          }>(
            `${withApiPrefix}/auth/refresh-token`,
            { refreshToken },
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          // Handle different response formats
          const accessToken =
            refreshResponse.data?.data?.accessToken ||
            refreshResponse.data?.accessToken;

          if (!accessToken) {
            throw new Error("No access token received from refresh endpoint");
          }

          // Update stored access token
          tokenStorage.setAccessToken(accessToken);

          // Process queued requests
          processQueue(null, accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = accessToken.startsWith(
            "Bearer ",
          )
            ? accessToken
            : `Bearer ${accessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          // Refresh failed — clear tokens, mark session expired, redirect.
          // The sessionExpired guard at the top of this interceptor stops any
          // subsequent in-flight 401s from looping while the navigation lands.
          isRefreshing = false;
          return expireSession(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
};

// Add response interceptors to both authenticated API instances
createResponseInterceptor(authApi);
createResponseInterceptor(authMultiFormApi);
