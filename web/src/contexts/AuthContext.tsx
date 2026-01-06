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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

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
    // Simple env-based authentication
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    const readOnlyPassword = import.meta.env.VITE_READONLY_PASSWORD;

    let role: 'ADMIN' | 'READ_ONLY' | null = null;

    if (username === 'admin' && password === adminPassword) {
      role = 'ADMIN';
    } else if (username === 'pentamont' && password === readOnlyPassword) {
      role = 'READ_ONLY';
    }

    if (role) {
      // Mock user object since we don't have a DB
      const mockUser: User = {
        id: role === 'ADMIN' ? 1 : 2,
        username: username,
        email: `${username}@pentamont.com`,
        role: role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('pentamont_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return true;
    }

    return false;
  };

  const logout = () => {
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
