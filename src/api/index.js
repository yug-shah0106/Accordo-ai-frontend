import axios from "axios";
import { tokenStorage } from "../utils/tokenStorage";

const buildBaseUrl = () => {
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

export const authApi = axios.create({
  baseURL: withApiPrefix,
});
export const authMultiFormApi = axios.create({
  baseURL: withApiPrefix,
});

const setAuthHeader = (config) => {
  const storedToken = tokenStorage.getAccessToken();
  if (!storedToken) {
    return config;
  }

  const token = storedToken.trim();
  config.headers["Authorization"] = token.startsWith("Bearer ")
    ? token
    : `Bearer ${token}`;

  return config;
};

// Request interceptors - Add access token to all requests
authApi.interceptors.request.use(setAuthHeader, (error) =>
  Promise.reject(error)
);

authMultiFormApi.interceptors.request.use(
  (config) => {
    config.headers["content-type"] = "multipart/form-data";
    return setAuthHeader(config);
  },
  (error) => Promise.reject(error)
);

// Response interceptors - Handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const createResponseInterceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Check if error is 401 and we haven't already retried
      // Also exclude refresh token endpoint to prevent infinite loop
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("/auth/refresh-token")
      ) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
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
          // Using request body approach (modify to use header if backend requires it)
          const refreshResponse = await axios.post(
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
