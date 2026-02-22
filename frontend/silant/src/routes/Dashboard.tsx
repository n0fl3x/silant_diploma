import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout(); // Вызываем logout из контекста (без навигации)
    navigate('/logout'); // Перенаправляем на /logout, где произойдёт редирект на /login
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Личный кабинет</h1>
        <button onClick={handleLogout} className="logout-button">
          Выйти
        </button>
      </header>
      <main className="dashboard-content">
        <p>Добро пожаловать в личный кабинет!</p>
      </main>
    </div>
  );
}
