import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  role?: 'ADMIN' | 'READ_ONLY';
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Función para redirigir al login cuando no hay sesión
const redirectToLogin = () => {
  localStorage.removeItem('pentamont_user');
  // Use BASE_URL from Vite to avoid hardcoded paths
  const baseUrl = import.meta.env.BASE_URL || '/';
  window.location.href = `${baseUrl}login`.replace(/\/+/g, '/');
};

import { useApi } from './ApiContext';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const api = useApi();

  useEffect(() => {
    // Check for existing user data on app start
    const savedUser = localStorage.getItem('pentamont_user');

    if (savedUser) {
      try {
        const storedUser = JSON.parse(savedUser);
        setUser(storedUser);
      } catch (error) {
        // Invalid user data, clear everything
        console.warn('Datos de usuario inválidos, redirigiendo al login');
        redirectToLogin();
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await api.api.auth.login.post({
        identifier: username,
        password
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data && data.success) {
        const { user: apiUser, token } = data.data;

        // Store token
        localStorage.setItem('pentamont_token', token);

        // Enhance user object with role
        // RESTORING LEGACY LOGIC: 'pentamont' is READ_ONLY, others (like 'admin') are ADMIN
        const role = apiUser.username === 'pentamont' ? 'READ_ONLY' : 'ADMIN';

        const userWithRole: User = {
          ...apiUser,
          role: role as 'ADMIN' | 'READ_ONLY',
        };

        localStorage.setItem('pentamont_user', JSON.stringify(userWithRole));
        setUser(userWithRole);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Login exception:', err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('pentamont_token');
    localStorage.removeItem('pentamont_user');
    setUser(null);
    redirectToLogin();
  };

  const hasRole = (allowedRoles: string[]) => {
    if (!user) return false;
    // Default to ADMIN if role is not present (backward compatibility)
    const userRole = user.role || 'ADMIN';
    return allowedRoles.includes(userRole);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
