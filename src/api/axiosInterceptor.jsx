import axios from "axios";

const axiosInterceptor = axios.create({
  baseURL: "http://127.0.0.1:8000/",
});

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

/* ================= REQUEST ================= */
axiosInterceptor.interceptors.request.use(
  (config) => {
    // ⛔ Skip auth endpoints completely
    if (
      config.url?.includes("/auth/token") ||
      config.url?.includes("/login")
    ) {
      return config;
    }

    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE ================= */
axiosInterceptor.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // If refresh already in progress, wait
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInterceptor(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(
          "http://127.0.0.1:8000/auth/token/refresh/",
          { refresh: refreshToken }
        );

        const newAccessToken = response.data.access;

        localStorage.setItem("access_token", newAccessToken);

        axiosInterceptor.defaults.headers.Authorization =
          `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        return axiosInterceptor(originalRequest);
      } catch (err) {
        processQueue(err, null);

        // 🔴 Refresh expired → logout
        localStorage.clear();
        window.location.href = "/login";

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInterceptor;
