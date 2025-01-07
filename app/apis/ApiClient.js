import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = "http://192.168.100.248:8083/v1/";

export const ACCESS_TOKEN_KEY = "my-jwt-access-token";
export const REFRESH_TOKEN_KEY = "my-jwt-refresh-token";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Cache-Control": "no-cache", // Desactiva el uso de la caché en todas las solicitudes
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      config.headers["x-refresh-token"] = `${refreshToken}`;
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
        const response = await apiClient.post("/auth/mobile-refresh");

        const refreshResponse = response.data;

        console.log(refreshResponse.data.data);

        const { accessToken } = refreshResponse.data;
        const { refreshToken } = refreshResponse.data;

        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

        originalRequest.headers["authorization"] = `Bearer ${accessToken}`;
        originalRequest.headers["x-refresh-token"] = `${refreshToken}`;

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
