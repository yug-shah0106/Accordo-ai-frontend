import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";
import { tokenStorage } from "../utils/tokenStorage";

const buildBaseUrl = (): string => {
  const rawBaseUrl = (import.meta.env.VITE_BACKEND_URL || "").trim();
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

const setAuthHeader = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
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
  Promise.reject(error)
);

authMultiFormApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    config.headers["content-type"] = "multipart/form-data";
    return setAuthHeader(config);
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptors - Handle token refresh
let isRefreshing = false;

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

let failedQueue: QueuedRequest[] = [];

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

const createResponseInterceptor = (instance: AxiosInstance): void => {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

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
            throw new Error("No refresh token available");
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
            }
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
          originalRequest.headers.Authorization = accessToken.startsWith("Bearer ")
            ? accessToken
            : `Bearer ${accessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear tokens and redirect to login
          processQueue(refreshError, null);
          tokenStorage.clearTokens();

          // Redirect to login page if not already there
          if (window.location.pathname !== "/sign-in") {
            window.location.href = "/sign-in";
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

// Add response interceptors to both authenticated API instances
createResponseInterceptor(authApi);
createResponseInterceptor(authMultiFormApi);
