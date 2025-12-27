import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing token and user data on app start
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      // Validar formato JWT (debe tener 3 partes separadas por puntos)
      const cleanToken = String(token).trim().replace(/^["']|["']$/g, '');
      const tokenParts = cleanToken.split('.');
      
      if (tokenParts.length !== 3) {
        // Token malformado, limpiar todo
        console.warn('Token malformado detectado al iniciar, limpiando localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return;
      }

      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        // Invalid user data, clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
