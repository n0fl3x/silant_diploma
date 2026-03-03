import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/MaintenanceCreate.css";


interface MaintenanceType {
  id: number;
  name: string;
}

const MaintenanceCreateForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    maintenance_date: '',
    operating_hours: '',
    work_order_number: '',
    work_order_date: '',
    maintenance_type_id: '',
    machine_factory_number: '',
    service_company_name: ''
  });
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [typesLoading, setTypesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaintenanceTypes = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('/api/v1/maintenance-types', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setMaintenanceTypes(response.data.data);
          if (response.data.data.length === 0) {
            setError('Не найдены доступные типы ТО. Обратитесь к администратору.');
          }
        } else {
          setError('Ошибка загрузки типов ТО: ' + response.data.message);
        }
      } catch (err) {
        console.error('Ошибка загрузки типов ТО:', err);
        setError('Не удалось загрузить типы ТО. Проверьте подключение к серверу.');
      } finally {
        setTypesLoading(false);
      }
    };

    fetchMaintenanceTypes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const submitData = {
        ...formData,
        maintenance_type_id: parseInt(formData.maintenance_type_id, 10)
      };

      await axios.post('/api/v1/maintenance-create', submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      navigate('/maintenance'); // Перенаправление после успешного создания
    } catch (err: any) {
      console.error('Ошибка создания ТО:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Не удалось создать ТО. Проверьте правильность заполнения формы.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="maintenance-create">
      <button
        type="button"
        className="maintenance-create__back-btn"
        onClick={() => navigate(-1)}
      >
        ← Назад
      </button>

      <h1>Создание технического обслуживания</h1>

      {error && (
        <div className="maintenance-create__error">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="maintenance-create__form"
      >
        <div className="maintenance-create__field">
          <label htmlFor="maintenance_date">Дата ТО:</label>
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
          <label htmlFor="operating_hours">Наработка (моточасы):</label>
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
          <label htmlFor="work_order_number">Номер наряд-заказа:</label>
          <input
            type="text"
            id="work_order_number"
            name="work_order_number"
            value={formData.work_order_number}
            onChange={handleChange}
            required
          />
        </div>

        <div className="maintenance-create__field">
          <label htmlFor="work_order_date">Дата наряд-заказа:</label>
          <input
            type="date"
            id="work_order_date"
            name="work_order_date"
            value={formData.work_order_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="maintenance-create__field">
          <label htmlFor="maintenance_type_id">Тип ТО:</label>
          {typesLoading ? (
            <div className="maintenance-create__loading">
              Загрузка типов ТО...
            </div>
          ) : maintenanceTypes.length === 0 ? (
            <div className="maintenance-create__no-data">
              Типы ТО не найдены
            </div>
          ) : (
            <select
              id="maintenance_type_id"
              name="maintenance_type_id"
              value={formData.maintenance_type_id}
              onChange={handleChange}
              required
              disabled={typesLoading}
            >
              <option value="">Выберите тип ТО</option>
              {maintenanceTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="maintenance-create__field">
          <label htmlFor="machine_factory_number">Заводской номер машины:</label>
          <input
            type="text"
            id="machine_factory_number"
            name="machine_factory_number"
            value={formData.machine_factory_number}
            onChange={handleChange}
            required
          />
        </div>

        <div className="maintenance-create__field">
          <label htmlFor="service_company_name">Обслуживающая организация:</label>
          <input
            type="text"
            id="service_company_name"
            name="service_company_name"
            value={formData.service_company_name}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="maintenance-create__submit-btn"
          disabled={loading || typesLoading}
        >
          {loading ? 'Создание...' : 'Создать ТО'}
        </button>
      </form>
    </div>
  );
};

export default MaintenanceCreateForm;
