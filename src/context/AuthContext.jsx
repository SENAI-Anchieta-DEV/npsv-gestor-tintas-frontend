import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getStoredToken,
  loginRequest,
  removeToken,
  storeToken,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(false);

  const isAuthenticated = Boolean(token);

  useEffect(() => {
    if (token) {
      storeToken(token);
    } else {
      removeToken();
    }
  }, [token]);

  async function login(credentials) {
    setLoading(true);

    try {
      const response = await loginRequest(credentials);

      console.log("TOKEN RECEBIDO:", response?.token);

      storeToken(response.token);
      setToken(response.token);

      return response;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    removeToken();
    setToken(null);
  }

  const value = useMemo(
    () => ({
      token,
      isAuthenticated,
      loading,
      login,
      logout,
    }),
    [token, isAuthenticated, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}