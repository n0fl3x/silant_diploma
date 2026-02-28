import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  user_description: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const fetchUserData = async (): Promise<void> => {
    try {
      const response = await fetch('/api/v1/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data.")
      }

      const userData = await response.json();

      const user: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        user_description: userData.user_description
      };

      setUser(user);
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    };
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await fetch('/api/v1/token-refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken })
      });

      if (!response.ok) return false;

      const { access } = await response.json();
      localStorage.setItem('access_token', access);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const checkAuth = async (): Promise<void> => {
    if (isChecking) return;

    setIsChecking(true);
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      let response = await fetch("/api/v1/authenticated", {
        method: "POST",
        credentials: "include",
      });

      if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          setIsAuthenticated(false);
          setUser(null);
          return;
        }
        response = await fetch("/api/v1/authenticated", {
          method: "POST",
          credentials: "include",
        });
      }

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
        if (data.user) {
          setUser(data.user);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
      setIsChecking(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Неверные учётные данные');
      }

      const data = await response.json();

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      await checkAuth();

      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.warn('Logout request failed, continuing cleanup:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Auth check timeout — setting loading to false');
        setLoading(false);
        setIsChecking(false);
      }
    }, 1000);

    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (accessToken && refreshToken) {
      setIsAuthenticated(true);
      fetchUserData();
    } else {
      checkAuth();
    }

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
