import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        const response = await fetch('/api/v1/logout', {
          method: 'POST',
          credentials: 'include'
        });

        if (response.ok) {
          // После успешного logout — редирект
          navigate('/login', { replace: true });
        } else {
          // Если что‑то пошло не так, всё равно перенаправляем на login
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Ошибка при выходе:', error);
        // В случае ошибки сети тоже перенаправляем
        navigate('/login', { replace: true });
      }
    };

    performLogout();
  }, [navigate]);

  return (
    <div className="logout-container">
      <p>Выход...</p>
    </div>
  );
}
