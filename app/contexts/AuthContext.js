import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import apiClient, { ACCESS_TOKEN_KEY } from "../apis/ApiClient";

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

      if (token) {
        apiClient.defaults.headers.Authorization = `Bearer ${token}`;
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
      const response = await apiClient.post("auth/signin", {
        email,
        password,
      });

      const accessToken = response.data.accessToken;

      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);

      apiClient.defaults.headers.Authorization = `Bearer ${accessToken}`;

      setAuthState({
        loading: false,
        authenticated: true,
      });

      console.log(apiClient.defaults.headers.Authorization);

      return response;
    } catch (e) {
      console.error(`Error en inicio de sesión: ${e.message}`);
      return { error: true, message: e.response?.data.message || e.message };
    }
  };

  const signout = async () => {
    try {
      await apiClient.post("/auth/signout", { withCredentials: true });
    } catch (e) {
      console.log(`Sesión cerrada satisfactoriamente : ${e}`);
    } finally {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      delete apiClient.defaults.headers.Authorization;
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
