import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('teato_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.getMe();
      setUser(data.user);
    } catch {
      setUser(null);
      localStorage.removeItem('teato_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.login({ email, password });
    localStorage.setItem('teato_token', data.token);
    setUser(data.user);
    return data;
  };

  const registerUser = async (name, email, password, phone) => {
    const { data } = await api.register({ name, email, password, phone });
    localStorage.setItem('teato_token', data.token);
    setUser(data.user);
    return data;
  };

  const logoutUser = async () => {
    try {
      await api.logout();
    } catch (_) {}
    localStorage.removeItem('teato_token');
    setUser(null);
  };

  const updateUser = (u) => setUser((prev) => (prev ? { ...prev, ...u } : null));

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register: registerUser,
        logout: logoutUser,
        refreshUser: fetchUser,
        updateUser,
        isAdmin: user?.role === 'admin' || user?.role === 'owner',
        isOwner: user?.role === 'owner',
        isKitchen: user?.role === 'kitchen',
        isDelivery: user?.role === 'delivery',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
