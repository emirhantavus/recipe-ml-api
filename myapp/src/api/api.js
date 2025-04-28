import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/", // Django API URL'in
});

// Request interceptor: Her isteğe token otomatik eklenir
API.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Token expiredsa otomatik refresh yapılır
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const response = await axios.post("http://127.0.0.1:8000/api/users/refresh/", {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem("access_token", newAccessToken);
        API.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      } catch (err) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/signin";
      }
    }

    return Promise.reject(error);
  }
);

export default API;
