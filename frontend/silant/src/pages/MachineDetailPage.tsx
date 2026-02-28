import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Machine } from '../types/Machine';
import '../styles/MachineDetail.css';

export default function MachineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { userGroup } = useAuth();

  const canEditOrDelete = userGroup === 'manager' || userGroup === 'superadmin';

  const [machine, setMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    };
    fetchMachineDetail(machineId);
  }, [id, isAuthenticated, authLoading, navigate]);

  const fetchMachineDetail = async (machineId: number) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      console.log(localStorage);
      if (!token) {
        throw new Error('Токен авторизации отсутствует');
      }

      const response = await fetch(`/api/v1/machines/${machineId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Машина не найдена');
        } else if (response.status === 401) {
          throw new Error('Требуется повторная авторизация');
        } else {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }
        return;
      }

      const data: Machine = await response.json();
      setMachine(data);
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить данные машины. Попробуйте позже.');
    } finally {
      console.log("fetchMachineDetail: Завершение загрузки (setLoading(false))");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!machine?.id) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Токен авторизации отсутствует');
      }

      const response = await fetch(`/api/v1/machine-delete/${machine.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Машина не найдена');
        } else if (response.status === 401) {
          throw new Error('Требуется повторная авторизация');
        } else {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }
      }

      navigate('/machine-list');
    } catch (err) {
      console.error('Ошибка при удалении машины:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Не удалось удалить машину. Попробуйте позже.');
      }
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="machine-detail-container">
        <div className="loading-spinner">⏳ Загрузка данных машины...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="machine-detail-container">
        <div className="error-message">{error}</div>
        <button
          className="back-button"
          onClick={() => navigate(-1)}
        >
          Назад к списку
        </button>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="machine-detail-container">
        <div className="error-message">Данные машины не найдены</div>
        <button
          className="back-button"
          onClick={() => navigate('/machine-list')}
        >
          К списку машин
        </button>
      </div>
    );
  }

  return (
    <div className="machine-detail-container">
      <div className="detail-header">
        <h1>Машина #{machine.id}</h1>
        <span className="factory-number">Заводской номер: {machine.factory_number}</span>
      </div>

      <div className="detail-grid">
        <div className="detail-section">
          <h3>Основная информация</h3>
          <div className="detail-item">
            <span className="label">Тех. наименование модели:</span>
            <span>{machine.model_tech_name || 'Не указано'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Договор поставки:</span>
            <span>{machine.delivery_contract || 'Не указан'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Дата отгрузки:</span>
            <span>
              {machine.shipment_date
                ? new Date(machine.shipment_date).toLocaleDateString()
                : 'Не указана'}
            </span>
          </div>
          <div className="detail-item">
            <span className="label">Грузополучатель:</span>
            <span>{machine.consignee || 'Не указан'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Адрес доставки:</span>
            <span>{machine.delivery_address || 'Не указан'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Конфигурация:</span>
            <span>{machine.configuration || 'Не указана'}</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>Двигатель</h3>
          <div className="detail-item">
            <span className="label">Модель:</span>
            <span>{machine.engine_model_name || 'Не указана'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Заводской номер:</span>
            <span>{machine.engine_factory_number || 'Не указан'}</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>Трансмиссия</h3>
          <div className="detail-item">
            <span className="label">Модель:</span>
            <span>{machine.transmission_model_name || 'Не указана'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Заводской номер:</span>
            <span>{machine.transmission_factory_number || 'Не указан'}</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>Ведущие оси</h3>
          <div className="detail-item">
            <span className="label">Модель:</span>
            <span>{machine.drive_axle_model_name || 'Не указана'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Заводской номер:</span>
            <span>{machine.drive_axle_factory_number || 'Не указан'}</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>Управляемые оси</h3>
          <div className="detail-item">
            <span className="label">Модель:</span>
            <span>{machine.steering_axle_model_name || 'Не указана'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Заводской номер:</span>
            <span>{machine.steering_axle_factory_number || 'Не указан'}</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>Клиент и сервис</h3>
          <div className="detail-item">
            <span className="label">Имя клиента:</span>
            <span>{machine.client_name || 'Не указан'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Сервисная компания:</span>
            <span>{machine.service_company_name || 'Не указана'}</span>
          </div>
        </div>
      </div>

      <div className="detail-actions">
        {canEditOrDelete && (
          <>
            <button
              className="delete-button"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Удаление...' : 'Удалить машину'}
            </button>
            <button
              className="edit-button"
              onClick={() => navigate(`/machine-edit/${machine.id}`)}
            >
              Редактировать
            </button>
          </>
        )}
        <button
          className="back-button"
          onClick={() => navigate(-1)}
        >
          Назад
        </button>
      </div>
    </div>
  );
}
