// src/components/ProtectedRoute.tsx
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkAuth } = useAuth();

  useEffect(() => {
    // Принудительная проверка при доступе к защищённому маршруту
    checkAuth();
  }, [checkAuth]);

  // Пока идёт проверка, показываем загрузчик
  if (!isAuthenticated === null) {
    return <div>Проверка авторизации...</div>;
  }

  // Если не аутентифицирован — редирект на login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Если аутентифицирован — показываем защищённый контент
  return <>{children}</>;
}
