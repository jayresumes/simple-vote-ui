import { useState, useEffect, useCallback } from "react";
import { authApi, setAuthToken, removeAuthToken, getAuthToken, type AuthResponse } from "@/lib/api";

interface AuthState {
  user: AuthResponse["user"] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const checkAuth = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const user = await authApi.getUser();
      setState({ user, isLoading: false, isAuthenticated: true });
    } catch {
      removeAuthToken();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setAuthToken(response.token);
    setState({ user: response.user, isLoading: false, isAuthenticated: true });
    return response;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue with logout even if API fails
    }
    removeAuthToken();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  };

  return {
    ...state,
    login,
    logout,
    checkAuth,
  };
}
