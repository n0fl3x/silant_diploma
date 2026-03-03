import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/MaintenanceEdit.css';


interface MaintenanceData {
  id: number;
  maintenance_date: string;
  operating_hours: number;
  work_order_number: string | null;
  work_order_date: string | null;
  maintenance_type_name: string;
  machine_factory_number: string;
  service_company_name: string;
}

const MaintenanceEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [maintenance, setMaintenance] = useState<MaintenanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`/api/v1/maintenance/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          const apiData = response.data.data;
          const formData: MaintenanceData = {
            id: apiData.id,
            maintenance_date: apiData.maintenance_date,
            operating_hours: apiData.operating_hours,
            work_order_number: apiData.work_order_number,
            work_order_date: apiData.work_order_date,
            maintenance_type_name: apiData.maintenance_type_name,
            machine_factory_number: apiData.machine.factory_number,
            service_company_name: apiData.service_company.user_description
          };
          setMaintenance(formData);
        } else {
          setError('Не удалось загрузить данные ТО');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка загрузки данных ТО');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMaintenance();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenance) return;

    try {
      setSuccessMessage(null);
      setError(null);

      const token = localStorage.getItem('access_token');

      const submitData = {
        maintenance_date: maintenance.maintenance_date,
        operating_hours: maintenance.operating_hours,
        work_order_number: maintenance.work_order_number,
        work_order_date: maintenance.work_order_date,
        maintenance_type_name: maintenance.maintenance_type_name,
        machine_factory_number: maintenance.machine_factory_number,
        service_company_name: maintenance.service_company_name
      };

      await axios.put(`/api/v1/maintenance-update/${id}`, submitData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSuccessMessage('Данные ТО успешно обновлены!');
      setTimeout(() => {
        navigate(`/maintenance/${id}`);
      }, 2000);
    } catch (err: any) {
      console.log(err);
      setError(err.errors || err.response?.data?.message || 'Ошибка при сохранении ТО');
    }
  };

  const handleChange = (field: keyof MaintenanceData, value: any) => {
    setMaintenance(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (loading) return (
    <div className="maintenance-edit-loading">
      <div className="spinner">⌛</div>
      Загрузка данных ТО...
    </div>
  );

  if (error) return (
    <div className="maintenance-edit-error">
      Ошибка: {error}
      <Link to={`/maintenance/${id}`} className="maintenance-edit__back-link">
        ← Вернуться к детальному просмотру
      </Link>
    </div>
  );

  if (!maintenance) return (
    <div className="maintenance-edit-error">
      Данные ТО недоступны
      <Link to="/maintenance" className="maintenance-edit__back-link">
        ← К списку ТО
      </Link>
    </div>
  );

  return (
    <div className="maintenance-edit">
      {successMessage && (
        <div className="maintenance-edit__success-message">
          {successMessage}
        </div>
      )}

      <div className="maintenance-edit__header">
        <h1 className="maintenance-edit__title">Редактирование ТО №{maintenance.id}</h1>
        <Link to={`/maintenance/${id}`} className="maintenance-edit__back-link">
          ← Назад к детальному просмотру
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="maintenance-edit__form">
        <div className="maintenance-edit__section">
          <h2 className="maintenance-edit__section-title">Основная информация</h2>

          <div className="maintenance-edit__field">
            <label className="maintenance-edit__label" htmlFor="maintenance_date">
              Дата проведения:
            </label>
            <input
              id="maintenance_date"
              type="date"
              value={maintenance.maintenance_date}
              onChange={(e) => handleChange('maintenance_date', e.target.value)}
              className="maintenance-edit__input"
              required
            />
          </div>

          <div className="maintenance-edit__field">
            <label className="maintenance-edit__label" htmlFor="operating_hours">
              Наработка (м/час):
            </label>
            <input
              id="operating_hours"
              type="number"
              value={maintenance.operating_hours}
              onChange={(e) => handleChange('operating_hours', Number(e.target.value))}
              className="maintenance-edit__input"
              required
              min="0"
            />
          </div>
        </div>

        <div className="maintenance-edit__section">
          <h2 className="maintenance-edit__section-title">Заказ-наряд</h2>

          <div className="maintenance-edit__field">
            <label className="maintenance-edit__label" htmlFor="work_order_number">
              № заказ-наряда:
            </label>
            <input
              id="work_order_number"
              type="text"
              value={maintenance.work_order_number || ''}
              onChange={(e) => handleChange('work_order_number', e.target.value)}
              className="maintenance-edit__input"
            />
          </div>

          <div className="maintenance-edit__field">
            <label className="maintenance-edit__label" htmlFor="work_order_date">
              Дата заказ-наряда:
            </label>
            <input
              id="work_order_date"
              type="date"
              value={maintenance.work_order_date || ''}
              onChange={(e) => handleChange('work_order_date', e.target.value)}
              className="maintenance-edit__input"
            />
          </div>
        </div>

        <div className="maintenance-edit__section">
          <h2 className="maintenance-edit__section-title">Справочные данные</h2>

          <div className="maintenance-edit__field">
            <label className="maintenance-edit__label" htmlFor="maintenance_type_name">
              Тип ТО:
            </label>
            <input
              id="maintenance_type_name"
              type="text"
              value={maintenance.maintenance_type_name}
              onChange={(e) => handleChange('maintenance_type_name', e.target.value)}
              className="maintenance-edit__input"
              placeholder="Введите название типа ТО"
              required
            />
          </div>

          <div className="maintenance-edit__field">
            <label className="maintenance-edit__label" htmlFor="machine_factory_number">
              Заводской номер машины:
            </label>
            <input
              id="machine_factory_number"
              type="text"
              value={maintenance.machine_factory_number}
              onChange={(e) => handleChange('machine_factory_number', e.target.value)}
              className="maintenance-edit__input"
              placeholder="Введите заводской номер"
              required
            />
          </div>

          <div className="maintenance-edit__field">
            <label className="maintenance-edit__label" htmlFor="service_company_name">
              Сервисная компания:
            </label>
            <input
              id="service_company_name"
              type="text"
              value={maintenance.service_company_name}
              onChange={(e) => handleChange('service_company_name', e.target.value)}
              className="maintenance-edit__input"
              placeholder="Введите название компании"
              required
            />
          </div>
        </div>

        <div className="maintenance-edit__actions">
          <button type="submit" className="maintenance-edit__save-btn">
            Сохранить изменения
          </button>
          <Link to={`/maintenance/${id}`} className="maintenance-edit__cancel-btn">
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceEdit;
