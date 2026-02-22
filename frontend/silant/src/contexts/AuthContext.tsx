// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { username: string; email: string } | null;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/v1/authenticated', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Проверка аутентификации не удалась:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const logout = async () => {
    await fetch('/api/v1/logout', { method: 'POST', credentials: 'include' });
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
