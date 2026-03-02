import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/MaintenanceCreate.css';

const MaintenanceCreateForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    maintenance_date: '',
    operating_hours: '',
    work_order_number: '',
    work_order_date: '',
    maintenance_type_name: '',
    machine_factory_number: '',
    service_company_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post('/api/v1/maintenance-create', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Переходим на страницу созданного ТО
        navigate(`/maintenance/${response.data.data.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при создании ТО');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="maintenance-create">
      <h1>Создание нового ТО</h1>

      {/* Кнопка «Назад» */}
      <button
        type="button"
        className="maintenance-create__back-btn"
        onClick={() => navigate('/dashboard')}
      >
        ← В личный кабинет
      </button>

      {error && <div className="maintenance-create__error">{error}</div>}

      <form onSubmit={handleSubmit} className="maintenance-create__form">
        <div className="maintenance-create__field">
          <label htmlFor="maintenance_date">Дата проведения:</label>
          <input
            type="date"
            id="maintenance_date"
            name="maintenance_date"
            value={formData.maintenance_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="maintenance-create__field">
          <label htmlFor="operating_hours">Наработка (м/час):</label>
          <input
            type="number"
            id="operating_hours"
            name="operating_hours"
            value={formData.operating_hours}
            onChange={handleChange}
            required
            min="0"
          />
        </div>

        <div className="maintenance-create__field">
          <label htmlFor="work_order_number">№ заказ‑наряда:</label>
          <input
            type="text"
            id="work_order_number"
            name="work_order_number"
            value={formData.work_order_number}
            onChange={handleChange}
          />
        </div>

        <div className="maintenance-create__field">
          <label htmlFor="work_order_date">Дата заказ‑наряда:</label>
          <input
            type="date"
            id="work_order_date"
            name="work_order_date"
            value={formData.work_order_date}
            onChange={handleChange}
          />
        </div>

        <div className="maintenance-create__field">
          <label htmlFor="maintenance_type_name">Тип ТО:</label>
          <input
            type="text"
            id="maintenance_type_name"
            name="maintenance_type_name"
            value={formData.maintenance_type_name}
            onChange={handleChange}
            placeholder="Введите полное название типа ТО"
            required
          />
        </div>

        <div className="maintenance-create__field">
          <label htmlFor="machine_factory_number">Заводской номер машины:</label>
          <input
            type="text"
            id="machine_factory_number"
            name="machine_factory_number"
            value={formData.machine_factory_number}
            onChange={handleChange}
            placeholder="Введите заводской номер"
            required
          />
        </div>

        <div className="maintenance-create__field">
          <label htmlFor="service_company_name">Название сервисной компании:</label>
          <input
            type="text"
            id="service_company_name"
            name="service_company_name"
            value={formData.service_company_name}
            onChange={handleChange}
            placeholder="Введите название компании"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="maintenance-create__submit-btn"
        >
          {loading ? 'Создание...' : 'Создать ТО'}
        </button>
      </form>
    </div>
  );
};

export default MaintenanceCreateForm;
