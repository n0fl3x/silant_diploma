import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MachineForm from '../components/MachineForm';
import type { MachineSubmitData } from '../components/MachineForm';
import '../styles/MachineCreate.css';

export default function MachineCreatePage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (data: MachineSubmitData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/v1/machine-create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        let errorMessage = 'Ошибка создания машины';

        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (parseError) {
          console.warn('Не удалось распарсить ответ об ошибке:', parseError);
        }

        throw new Error(errorMessage);
      }

      const newMachine = await response.json();
      console.log('Машина успешно создана:', newMachine);
      navigate(`/machine-detail/${newMachine.id}`);
    } catch (err) {
      console.error('Ошибка при создании машины:', err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Неизвестная ошибка при создании машины');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="machine-create-container">
      <h1>Создание новой машины</h1>

      {loading && (
        <div className="loading-indicator">
          Создание машины... Пожалуйста, подождите.
        </div>
      )}

      <MachineForm
        onSubmit={handleSubmit}
        isLoading={loading}
      />
    </div>
  );
}
