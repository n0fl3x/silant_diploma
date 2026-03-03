import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/MaintenanceDetail.css';

interface MaintenanceData {
  id: number;
  maintenance_date: string;
  operating_hours: number;
  work_order_number: string | null;
  work_order_date: string | null;
  maintenance_type_id: number;
  maintenance_type_name: string;
  machine: {
    id: number;
    factory_number: string;
    model_tech: {
      id: number;
      name: string;
    };
  };
  service_company: {
    id: number;
    user_description: string;
  };
}

const MaintenanceDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [maintenance, setMaintenance] = useState<MaintenanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaintenanceDetail = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`/api/v1/maintenance/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setMaintenance(response.data.data);
        } else {
          setError('Не удалось загрузить данные ТО');
        }
      } catch (err: any) {
        let errorMessage = 'Ошибка загрузки данных ТО';

        if (err.response?.status === 404) {
          errorMessage = 'ТО не найдено';
        } else if (err.response?.status === 403) {
          errorMessage = 'Нет доступа к этой информации';
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMaintenanceDetail();
    } else {
      setError('ID ТО не указан');
      setLoading(false);
    }
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;

    // Показываем стандартное браузерное окно подтверждения
    const shouldDelete = window.confirm(
      `Вы уверены, что хотите удалить ТО №${maintenance?.id} от ${maintenance?.maintenance_date}?`
    );

    if (!shouldDelete) return; // Пользователь нажал «Отмена»

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Токен авторизации отсутствует');
        return;
      }

      await axios.delete(`/api/v1/maintenance-delete/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // После успешного удаления перенаправляем на список ТО
      navigate('/maintenance');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Ошибка при удалении ТО. Попробуйте позже.'
      );
    }
  };

  if (loading) return <div className="maintenance-detail-loading">Загрузка данных ТО...</div>;
  if (error) return <div className="maintenance-detail-error">{error}</div>;
  if (!maintenance) return <div className="maintenance-detail-error">Данные ТО недоступны</div>;

  return (
    <div className="maintenance-detail">
      <div className="maintenance-detail__header">
        <h1 className="maintenance-detail__title">
          Техническое обслуживание №{maintenance.id}
        </h1>
        <div className="maintenance-detail__actions">
          <button
            type="button"
            className="maintenance-detail__delete-btn"
            onClick={handleDelete}
            title="Удалить это ТО"
          >
            Удалить ТО
          </button>
          <Link
            to={`/maintenance-edit/${maintenance.id}`}
            className="maintenance-detail__edit-btn"
          >
            Редактировать ТО
          </Link>
          <Link to="/maintenance" className="maintenance-detail__back-link">
            ← Назад к списку ТО
          </Link>
        </div>
      </div>

      <div className="maintenance-detail__content">
        <div className="maintenance-detail__section">
          <h2 className="maintenance-detail__section-title">Основная информация</h2>
          <div className="maintenance-detail__info-grid">
            <div className="maintenance-detail__info-item">
              <span className="maintenance-detail__label">Вид ТО:</span>
              <span className="maintenance-detail__value">
                <Link to={`/dictionary/${maintenance.maintenance_type_id}`}>
                  {maintenance.maintenance_type_name}
                </Link>
              </span>
            </div>
            <div className="maintenance-detail__info-item">
              <span className="maintenance-detail__label">Дата проведения:</span>
              <span className="maintenance-detail__value">{maintenance.maintenance_date}</span>
            </div>
            <div className="maintenance-detail__info-item">
              <span className="maintenance-detail__label">Наработка (м/час):</span>
              <span className="maintenance-detail__value">{maintenance.operating_hours}</span>
            </div>
          </div>
        </div>

        <div className="maintenance-detail__section">
          <h2 className="maintenance-detail__section-title">Информация о машине</h2>
          <div className="maintenance-detail__info-grid">
            <div className="maintenance-detail__info-item">
              <span className="maintenance-detail__label">Заводской номер:</span>
              <span className="maintenance-detail__value">
                <Link to={`/machine-detail/${maintenance.machine.id}`}>
                  {maintenance.machine.factory_number}
                </Link>
              </span>
            </div>
            <div className="maintenance-detail__info-item">
              <span className="maintenance-detail__label">Модель техники:</span>
              <span className="maintenance-detail__value">
                <Link to={`/dictionary/${maintenance.machine.model_tech.id}`}>
                  {maintenance.machine.model_tech.name}
                </Link>
              </span>
            </div>
          </div>
        </div>

        <div className="maintenance-detail__section">
          <h2 className="maintenance-detail__section-title">Документы</h2>
          <div className="maintenance-detail__info-grid">
            <div className="maintenance-detail__info-item">
              <span className="maintenance-detail__label">№ заказ‑наряда:</span>
              <span className="maintenance-detail__value">
                {maintenance.work_order_number || 'Не указан'}
              </span>
            </div>
            <div className="maintenance-detail__info-item">
              <span className="maintenance-detail__label">Дата заказ‑наряда:</span>
              <span className="maintenance-detail__value">
                {maintenance.work_order_date || 'Не указана'}
              </span>
            </div>
          </div>
        </div>

        <div className="maintenance-detail__section">
          <h2 className="maintenance-detail__section-title">Исполнитель</h2>
          <div className="maintenance-detail__info-grid">
            <div className="maintenance-detail__info-item">
              <span className="maintenance-detail__label">Сервисная компания:</span>
              <span className="maintenance-detail__value">
                {maintenance.service_company.user_description}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDetail;
