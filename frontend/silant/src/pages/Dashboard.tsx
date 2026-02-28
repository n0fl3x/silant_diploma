import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { userGroup } = useAuth();
  const [userLoading, setUserLoading] = useState(true);

  const canCreateMachine = userGroup === 'manager' || userGroup === 'superadmin';
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (!authLoading && !user) {
      setUserLoading(true);
    } else if (user) {
      setUserLoading(false);
    }
  }, [isAuthenticated, authLoading, user]);

  if (authLoading || userLoading) {
    return <div>Загрузка личного кабинета...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Личный кабинет</h1>
        {user && <p>Добро пожаловать, {user.username}!</p>}
      </header>
      <main className="dashboard-content">
        <div className="dashboard-actions">
          {canCreateMachine && (
            <button
              className="create-machine-btn"
              onClick={() => navigate('/machine-create')}
            >
              Создать новую машину
            </button>
          )}
        </div>

        <div className="user-profile">
          <h2>Данные пользователя</h2>
          {user ? (
            <div className="user-info">
              <div className="info-item">
                <span className="label">Имя пользователя:</span>
                <span className="value">{user.username}</span>
              </div>
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">
                  {user.email || <em>не указан</em>}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Описание:</span>
                <span className="value">
                  {user.user_description || <em>не указано</em>}
                </span>
              </div>
              {user.id && (
                <div className="info-item">
                  <span className="label">ID пользователя:</span>
                  <span className="value">{user.id}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="no-user-data">
              Не удалось загрузить данные пользователя. Пожалуйста, обновите страницу.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
