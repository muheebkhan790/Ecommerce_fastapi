"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { accountApi } from "../lib/api/account";

const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await accountApi.getMe();
      setUser(userData);
      return userData;
    } catch {
      // Try refresh token if access token has expired
      try {
        await accountApi.refresh();
        const refreshedUser = await accountApi.getMe();
        setUser(refreshedUser);
        return refreshedUser;
      } catch {
        setUser(null);
        return null;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials) => {
    await accountApi.login(credentials);
    return await refreshUser();
  };

  const register = async (userData) => {
    const newUser = await accountApi.register(userData);
    // After register, attempt to login or return user
    return newUser;
  };

  const logout = async () => {
    try {
      await accountApi.logout();
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: !!user?.is_admin,
    login,
    register,
    logout,
    refreshUser,
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
