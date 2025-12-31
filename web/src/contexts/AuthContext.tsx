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

// Función para redirigir al login cuando el token es inválido
const redirectToLogin = () => {
  localStorage.removeItem('pentamont_token');
  localStorage.removeItem('pentamont_user');
  // Use BASE_URL from Vite to avoid hardcoded paths
  const baseUrl = import.meta.env.BASE_URL || '/';
  window.location.href = `${baseUrl}login`.replace(/\/+/g, '/');
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing token and user data on app start
    const token = localStorage.getItem('pentamont_token');
    const savedUser = localStorage.getItem('pentamont_user');

    if (token && savedUser) {
      // Validar formato JWT (debe tener 3 partes separadas por puntos)
      const cleanToken = String(token).trim().replace(/^["']|["']$/g, '');
      const tokenParts = cleanToken.split('.');

      if (tokenParts.length !== 3) {
        // Token malformado, limpiar todo y redirigir
        console.warn('Token malformado detectado al iniciar, redirigiendo al login');
        console.warn('Token malformado detectado al iniciar, redirigiendo al login');
        redirectToLogin();
        return;
      }

      try {
        setUser(JSON.parse(savedUser));

        // Verificar que el token sea válido con el backend
        const verifyToken = async () => {
          try {
            const response = await fetch(`${window.location.origin}/pentamont/api/auth/me`, {
              headers: {
                'Authorization': `Bearer ${cleanToken}`
              }
            });

            if (!response.ok || response.status === 401) {
              // Token inválido o expirado, redirigir al login
              console.warn('Token inválido o expirado, redirigiendo al login');
              redirectToLogin();
              return;
            }

            const data = await response.json();
            if (!data.success) {
              redirectToLogin();
            }
          } catch (error) {
            // Error de red, pero no redirigir (podría ser temporal)
            console.warn('Error verificando token:', error);
          }
        };

        verifyToken();
      } catch (error) {
        // Invalid user data, clear everything
        console.warn('Datos de usuario inválidos, redirigiendo al login');
        console.warn('Datos de usuario inválidos, redirigiendo al login');
        redirectToLogin();
      }
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('pentamont_token', token);
    localStorage.setItem('pentamont_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('pentamont_token');
    localStorage.removeItem('pentamont_user');
    setUser(null);
    setUser(null);
    redirectToLogin();
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
