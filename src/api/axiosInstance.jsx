import axios from "axios";
import { jwtDecode } from "jwt-decode";

// ✅ Base Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// 🔁 Refresh token API endpoint
const REFRESH_URL = import.meta.env.VITE_API_BASE_URL +"auth/token/refresh/";

// 🔍 Helper: Check if token is expired
function isTokenExpired(token) {
  try {
    const { exp } = jwtDecode(token);
    if (!exp) return true;
    return Date.now() >= exp * 1000; // expired if current time >= exp
  } catch {
    return true; // invalid token
  }
}

// 🚨 Prevent multiple refresh calls at once
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// 🔄 Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response, // Return response directly
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized only once
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Avoid multiple refresh calls
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      const accessToken = localStorage.getItem("accessToken");

      // ✅ Check if access token actually expired
      if (!refreshToken || !isTokenExpired(accessToken)) {
        console.warn("Access token still valid or no refresh token found.");
        return Promise.reject(error);
      }

      try {
        console.log("🔄 Refreshing access token...");

        const response = await axios.post(REFRESH_URL, { refresh: refreshToken });
        const newAccessToken = response.data.access;

        // Save new access token
        localStorage.setItem("accessToken", newAccessToken);

        // Update axios headers globally
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

        // Process any pending requests
        processQueue(null, newAccessToken);

        // Retry the original failed request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error("❌ Token refresh failed:", refreshError);

        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Other error handling
    if (error.response) {
      const { status } = error.response;
      if (status === 403) console.error("Forbidden access.");
      if (status >= 500) console.error("Server error:", error.response.data);
    } else {
      console.error("Network error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
