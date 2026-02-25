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
  const [isChecking, setIsChecking] = useState(false); // Флаг предотвращения дублирования

  const checkAuth = async (): Promise<void> => {
    // Если уже идёт проверка авторизации, прерываем новый вызов
    if (isChecking) {
      console.log('checkAuth aborted — already checking');
      return;
    };

    setIsChecking(true); // Устанавливаем флаг начала проверки
    setLoading(true);  // Устанавливаем состояние загрузки

    try {
      const response = await fetch("/api/v1/authenticated", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
        setUser(data.user || null);
      } else {
        // Если сервер вернул не-OK статус, считаем пользователя не авторизованным
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);   // Снимаем состояние загрузки
      setIsChecking(false); // Снимаем флаг проверки
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Здесь нужно реализовать логику логина — предположим, есть эндпоинт /api/v1/login
      const loginResponse = await fetch("/api/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!loginResponse.ok) {
        throw new Error("Login failed");
      }

      // После успешного логина проверяем авторизацию
      await checkAuth();
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    // Очищаем состояние
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    // При инициализации проверяем статус авторизации
    checkAuth();
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
