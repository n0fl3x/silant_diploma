import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({
  children
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading } = useAuth(); // Берём loading из контекста
  const [localLoading, setLocalLoading] = useState(true);

  // Устанавливаем локальную загрузку только при первом монтировании
  useEffect(() => {
    setLocalLoading(false);
  }, []);

  // Показываем индикатор, пока идёт общая проверка авторизации ИЛИ пока монтируется ProtectedRoute
  if (loading || localLoading) {
    return <div>Проверка авторизации...</div>;
  }

  // Если не авторизован — редирект на login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Если авторизован и загрузка завершена — показываем защищённый контент
  return <>{children}</>;
}
