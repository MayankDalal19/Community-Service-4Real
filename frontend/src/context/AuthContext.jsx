import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

// Purge legacy persistent localStorage tokens so users are never automatically logged in as Admin on site visits
try {
  localStorage.removeItem("sahyog_token");
  localStorage.removeItem("sahyog_user");
} catch {}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem("sahyog_token") || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem("sahyog_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Validate existing session token on application load
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      const storedToken = sessionStorage.getItem("sahyog_token");
      if (!storedToken) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const res = await authService.getMe();
        if (mounted && res.data) {
          setUser(res.data);
          sessionStorage.setItem("sahyog_user", JSON.stringify(res.data));
        }
      } catch (err) {
        console.warn("Session check failed or expired:", err.message);
        if (mounted) {
          sessionStorage.removeItem("sahyog_token");
          sessionStorage.removeItem("sahyog_user");
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
    sessionStorage.setItem("sahyog_token", newToken);
    sessionStorage.setItem("sahyog_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    const { token: newToken, user: newUser } = res.data;
    sessionStorage.setItem("sahyog_token", newToken);
    sessionStorage.setItem("sahyog_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    sessionStorage.removeItem("sahyog_token");
    sessionStorage.removeItem("sahyog_user");
    try {
      localStorage.removeItem("sahyog_token");
      localStorage.removeItem("sahyog_user");
    } catch {}
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser((prev) => {
      const next = { ...prev, ...updated };
      sessionStorage.setItem("sahyog_user", JSON.stringify(next));
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
