import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import apiClient, {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from "../apis/ApiClient";

const AuthContext = createContext({});

const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    authenticated: false,
    loading: true,
  });

  useEffect(() => {
    const loadToken = async () => {
      const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

      if (token && refreshToken) {
        apiClient.defaults.headers["authorization"] = `Bearer ${token}`;
        apiClient.defaults.headers["x-refresh-token"] = `${refreshToken}`;
        setAuthState({ authenticated: true, loading: false });
      } else {
        setAuthState({ authenticated: false, loading: false });
      }
    };

    loadToken();
  }, []);

  const signin = async (email, password) => {
    try {
      console.log("Base URL de Axios:", apiClient.defaults.baseURL);
      console.log(`Email: ${email}, Password: ${password}`);
      const response = await apiClient.post("auth/mobile-signin", {
        email,
        password,
      });

      const signinResponse = response.data;

      const accessToken = signinResponse.data.accessToken;
      const refreshToken = signinResponse.data.refreshToken;

      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

      apiClient.defaults.headers["authorization"] = `Bearer ${accessToken}`;
      apiClient.defaults.headers["x-refresh-token"] = refreshToken;

      setAuthState({
        loading: false,
        authenticated: true,
      });

      return response;
    } catch (e) {
      console.error(`Error en inicio de sesión: ${e.message}`);
      return { error: true, message: e.response?.data.message || e.message };
    }
  };

  const signout = async () => {
    try {
      await apiClient.post("/auth/mobile-signout");
    } catch (e) {
      console.log(`Sesión cerrada satisfactoriamente : ${e}`);
    } finally {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      delete apiClient.defaults.headers.Authorization;
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      delete apiClient.defaults.headers["x-refresh-token"];

      setAuthState({ authenticated: false, loading: false });
    }
  };

  const signup = async (fullname, email, password) => {
    try {
      return await apiClient.post("/auth/signup", {
        fullname,
        email,
        password,
      });
    } catch (e) {
      console.error(`Error en registro: ${e}`);
      return { error: true, message: e.response.data.message };
    }
  };

  const value = {
    onSignup: signup,
    onSignin: signin,
    onSignout: signout,
    authState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { useAuth, AuthProvider };
