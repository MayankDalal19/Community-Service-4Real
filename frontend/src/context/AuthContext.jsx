import { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(true);

  // Validate session against server on startup
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      const storedToken = authService.getToken();
      if (!storedToken) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getMe();
        if (mounted) {
          setUser(currentUser);
          setToken(storedToken);
        }
      } catch (err) {
        // If token expired or invalid, clear local session
        console.warn("Session check failed or expired:", err.message);
        authService.logout();
        if (mounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const register = async (formData) => {
    const data = await authService.register(formData);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
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

export default AuthContext;
