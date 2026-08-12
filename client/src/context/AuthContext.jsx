import { createContext, useContext, useEffect, useState } from "react";
import { api, setToken, clearToken } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while validating stored token

  useEffect(() => {
    if (!localStorage.getItem("sp_token")) {
      setLoading(false);
      return;
    }
    api("/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const d = await api("/auth/login", { method: "POST", body: { email, password }, auth: false });
    setToken(d.token);
    setUser(d.user);
    return d.user;
  };

  const register = async (payload) => {
    // payload: { name, email, password, role, orgName, phone }
    const d = await api("/auth/register", { method: "POST", body: payload, auth: false });
    setToken(d.token);
    setUser(d.user);
    return d.user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
