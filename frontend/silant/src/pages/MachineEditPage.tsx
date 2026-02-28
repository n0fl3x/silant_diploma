import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Machine } from '../types/Machine';
import MachineForm from '../components/MachineForm';
import type { MachineSubmitData } from '../components/MachineForm';
import '../styles/MachineEdit.css';

export default function MachineEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [machine, setMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/login');
      return;
    }

    const machineId = Number(id);
    if (isNaN(machineId) || machineId <= 0) {
      setError('Некорректный ID машины');
      setLoading(false);
      return;
    }
    fetchMachineDetail(machineId);
  }, [id, isAuthenticated, authLoading, navigate]);

  const fetchMachineDetail = async (machineId: number) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`/api/v1/machines/${machineId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Ошибка загрузки данных');

      const data: Machine = await response.json();
      setMachine(data);
    } catch (err) {
      console.error('Ошибка загрузки машины для редактирования:', err);
      setError('Не удалось загрузить данные для редактирования');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData: MachineSubmitData) => {
    if (!machine) return;

    try {
      setIsSaving(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const saveData = {
        ...formData,
        id: machine.id // добавляем ID для обновления
      };

      const response = await fetch(`/api/v1/machine-update/${machine.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saveData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Ошибка сохранения');
      }

      const updatedMachine = await response.json();
      console.log('Машина успешно обновлена:', updatedMachine);
      navigate(`/machine-detail/${updatedMachine.id}`);
    } catch (err) {
      console.error('Ошибка при сохранении машины:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Неизвестная ошибка при сохранении');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!machine) {
    return <div>Машина не найдена</div>;
  }

  return (
    <div className="machine-edit-container">
      <h1>Редактирование машины #{machine.id}</h1>

      <MachineForm
        initialData={machine}
        onSubmit={handleFormSubmit}
        isLoading={isSaving}
      />
    </div>
  );
}
