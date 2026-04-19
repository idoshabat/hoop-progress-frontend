import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:8000/api/",
  baseURL: "https://hoopprogress.duckdns.org/api/",
  withCredentials: true,
});

let refreshAccessTokenHandler: (() => Promise<string | null>) | null = null;
let authFailureHandler: (() => void) | null = null;

export const registerAuthHandlers = ({
  refreshAccessToken,
  onAuthFailure,
}: {
  refreshAccessToken: () => Promise<string | null>;
  onAuthFailure: () => void;
}) => {
  refreshAccessTokenHandler = refreshAccessToken;
  authFailureHandler = onAuthFailure;
};

export const setAccessToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & {
      _retry?: boolean;
      _skipAuthRefresh?: boolean;
    }) | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = String(originalRequest.url || "");
    const isRefreshRequest = requestUrl.includes("token/refresh/");
    const isAuthRequest =
      requestUrl.includes("login/") ||
      requestUrl.includes("register/") ||
      requestUrl.includes("logout/");

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest._skipAuthRefresh ||
      isRefreshRequest ||
      isAuthRequest ||
      !refreshAccessTokenHandler
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const nextAccessToken = await refreshAccessTokenHandler();

    if (!nextAccessToken) {
      authFailureHandler?.();
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
    return api(originalRequest);
  }
);

export default api;
