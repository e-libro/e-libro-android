import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = "http://10.128.2.11:8083/v1/";

export const ACCESS_TOKEN_KEY = "my-jwt-access-token";

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      console.log("Refreshing token...");
      originalRequest._retry = true;

      try {
        const refreshResponse = await apiClient.post(
          "/auth/refresh",
          {},
          { withCredentials: true }
        );

        const { accessToken } = refreshResponse.data;

        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);

        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        return apiClient(originalRequest);
      } catch (e) {
        console.error("Error refreshing token:", e);
        return Promise.reject(e);
      }
    }
    if (!error) {
      console.log(
        "Error en la solicitud, sin respuesta del servidor:",
        error.message
      );
    }
    return Promise.reject(error);
  }
);

export default apiClient;
