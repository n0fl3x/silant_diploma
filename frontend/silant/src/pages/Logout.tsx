import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Logout() {
  const navigate = useNavigate();
  const { logout: clearAuth } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performLogout = async () => {
      try {
        setIsLoggingOut(true);
        setError(null);

        const response = await fetch('/api/v1/logout', {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        await clearAuth();

        navigate('/login', { replace: true });
      } catch (err) {
        console.error('Ошибка при выходе:', err);
        setError('Не удалось выйти из системы. Выполняется переход на страницу входа...');

        try {
          await clearAuth();
        } catch (clearErr) {
          console.warn('Ошибка при очистке состояния аутентификации:', clearErr);
        }

        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } finally {
        setIsLoggingOut(false);
      }
    };

    performLogout();
  }, [navigate, clearAuth]);

  if (isLoggingOut) {
    return (
      <div className="logout-container">
        <p>{error ? error : 'Выход из системы...'}</p>
        <div className="loading-spinner">⏳</div>
      </div>
    );
  }

  return null;
}
