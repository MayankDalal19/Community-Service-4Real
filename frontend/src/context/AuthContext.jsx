import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("sahyog_token") || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("sahyog_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Validate existing token on initial application load
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      const storedToken = localStorage.getItem("sahyog_token");
      if (!storedToken) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const res = await authService.getMe();
        if (mounted && res.data) {
          setUser(res.data);
          localStorage.setItem("sahyog_user", JSON.stringify(res.data));
        }
      } catch (err) {
        console.warn("Session check failed or expired:", err.message);
        if (mounted) {
          localStorage.removeItem("sahyog_token");
          localStorage.removeItem("sahyog_user");
          setToken(null);
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkAuth();

    // Listen for auth expired events from the API interceptor
    const handleExpired = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener("sahyog:auth_expired", handleExpired);

    return () => {
      mounted = false;
      window.removeEventListener("sahyog:auth_expired", handleExpired);
    };
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("sahyog_token", newToken);
    localStorage.setItem("sahyog_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("sahyog_token", newToken);
    localStorage.setItem("sahyog_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem("sahyog_token");
    localStorage.removeItem("sahyog_user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser((prev) => {
      const next = { ...prev, ...updated };
      localStorage.setItem("sahyog_user", JSON.stringify(next));
      return next;
    });
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
