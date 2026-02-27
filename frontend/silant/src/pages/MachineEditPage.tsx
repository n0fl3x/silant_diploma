import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Machine } from '../types/Machine';
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

  const handleChange = (
    field: keyof Machine | 'model_tech_input' | 'engine_model_input' |
            'transmission_model_input' | 'drive_axle_model_input' |
            'steering_axle_model_input' | 'client_input' | 'service_company_input',
    value: string | null
  ) => {
    setMachine(prev => {
      if (!prev) return null;

      if (field === 'model_tech_input') {
        return {
            ...prev,
            model_tech_input: value,
            model_tech_name: value || null
        };
      };

      if (field === 'engine_model_input') {
        return {
            ...prev,
            engine_model_input: value,
            engine_model_name: value || null
        };
      };

      if (field === 'transmission_model_input') {
        return {
            ...prev,
            transmission_model_input: value,
            transmission_model_name: value || null
        };
      };

      if (field === 'drive_axle_model_input') {
        return {
            ...prev,
            drive_axle_model_input: value,
            drive_axle_model_name: value || null
        };
      };

      if (field === 'steering_axle_model_input') {
        return {
            ...prev,
            steering_axle_model_input: value,
            steering_axle_model_name: value || null
        };
      };

      if (field === 'client_input') {
        return {
            ...prev,
            client_input: value,
            client_name: value || null
        };
      };

      if (field === 'service_company_input') {
        return {
            ...prev,
            service_company_input: value,
            service_company_name: value || null
        };
      };

      return { ...prev, [field]: value };
    });
  };

  const handleSave = async () => {
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
        factory_number: machine.factory_number,
        model_tech_input: machine.model_tech_name,
        engine_model_input: machine.engine_model_name,
        engine_factory_number: machine.engine_factory_number,
        transmission_model_input: machine.transmission_model_name,
        transmission_factory_number: machine.transmission_factory_number,
        drive_axle_model_input: machine.drive_axle_model_name,
        drive_axle_factory_number: machine.drive_axle_factory_number,
        steering_axle_model_input: machine.steering_axle_model_name,
        steering_axle_factory_number: machine.steering_axle_factory_number,
        delivery_contract: machine.delivery_contract,
        shipment_date: machine.shipment_date,
        consignee: machine.consignee,
        delivery_address: machine.delivery_address,
        configuration: machine.configuration,
        client_input: machine.client_name || null,
        service_company_input: machine.service_company_name || null
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
      };

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

      <div className="edit-form">
        <div className="form-section">
          <h3>Основные данные машины</h3>

          <div className="form-group">
            <label htmlFor="factory_number">Заводской номер машины:</label>
            <input
              type="text"
              id="factory_number"
              value={machine.factory_number || ''}
              onChange={(e) => handleChange('factory_number', e.target.value)}
              placeholder="Введите заводской номер"
            />
          </div>

          <div className="form-group">
            <label htmlFor="model_tech_input">Модель техники:</label>
            <input
              type="text"
              id="model_tech_input"
              value={machine.model_tech_name || ''}
              onChange={(e) => handleChange('model_tech_input', e.target.value)}
              placeholder="Начните вводить название модели..."
            />
            <small className="hint">Будет выполнен поиск в справочнике моделей техники</small>
          </div>
        </div>

        <div className="form-section">
          <h3>Компоненты машины</h3>

          <div className="form-group">
            <label htmlFor="engine_model_input">Модель двигателя:</label>
            <input
              type="text"
              id="engine_model_input"
              value={machine.engine_model_name || ''}
              onChange={(e) => handleChange('engine_model_input', e.target.value)}
              placeholder="Начните вводить название модели двигателя..."
            />
            <small className="hint">Поиск в справочнике моделей двигателей</small>
          </div>

          <div className="form-group">
            <label htmlFor="engine_factory_number">Зав. № двигателя:</label>
            <input
              type="text"
              id="engine_factory_number"
              value={machine.engine_factory_number || ''}
              onChange={(e) => handleChange('engine_factory_number', e.target.value)}
              placeholder="Введите заводской номер двигателя"
            />
          </div>

          <div className="form-group">
            <label htmlFor="transmission_model_input">Модель трансмиссии:</label>
            <input
              type="text"
              id="transmission_model_input"
              value={machine.transmission_model_name || ''}
              onChange={(e) => handleChange('transmission_model_input', e.target.value)}
              placeholder="Начните вводить название модели трансмиссии..."
            />
            <small className="hint">Поиск в справочнике моделей трансмиссий</small>
          </div>

          <div className="form-group">
            <label htmlFor="drive_axle_model_input">Модель ведущего моста:</label>
            <input
              type="text"
              id="drive_axle_model_input"
              value={machine.drive_axle_model_name || ''}
              onChange={(e) => handleChange('drive_axle_model_input', e.target.value)}
              placeholder="Начните вводить название модели ведущего моста..."
            />
            <small className="hint">Поиск в справочнике моделей ведущих мостов</small>
          </div>

          <div className="form-group">
            <label htmlFor="steering_axle_model_input">Модель управляемого моста:</label>
            <input
              type="text"
              id="steering_axle_model_input"
              value={machine.steering_axle_model_name || ''}
              onChange={(e) => handleChange('steering_axle_model_input', e.target.value)}
              placeholder="Начните вводить название модели управляемого моста..."
            />
            <small className="hint">Поиск в справочнике моделей управляемых мостов</small>
          </div>
        </div>

        <div className="form-section">
          <h3>Логистика и комплектация</h3>

          <div className="form-group">
            <label htmlFor="shipment_date">Дата отгрузки с завода:</label>
            <input
              type="date"
              id="shipment_date"
              value={machine.shipment_date || ''}
              onChange={(e) => handleChange('shipment_date', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="delivery_contract">Договор поставки №, дата:</label>
            <input
              type="text"
              id="delivery_contract"
              value={machine.delivery_contract || ''}
              onChange={(e) => handleChange('delivery_contract', e.target.value)}
              placeholder="Номер и дата договора"
            />
          </div>

          <div className="form-group">
            <label htmlFor="consignee">Грузополучатель (конечный потребитель):</label>
            <input
              type="text"
              id="consignee"
              value={machine.consignee || ''}
              onChange={(e) => handleChange('consignee', e.target.value)}
              placeholder="Наименование грузополучателя"
            />
          </div>

          <div className="form-group">
            <label htmlFor="delivery_address">Адрес поставки (эксплуатации):</label>
            <textarea
              id="delivery_address"
              value={machine.delivery_address || ''}
              onChange={(e) => handleChange('delivery_address', e.target.value)}
              placeholder="Полный адрес поставки"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="configuration">Комплектация (доп. опции):</label>
            <textarea
              id="configuration"
              value={machine.configuration || ''}
              onChange={(e) => handleChange('configuration', e.target.value)}
              placeholder="Описание комплектации и дополнительных опций"
              rows={4}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Клиент и сервисная организация</h3>

          <div className="form-group">
            <label htmlFor="client_input">Клиент:</label>
            <input
                type="text"
                id="client_input"
                value={machine.client_name || ''}
                onChange={(e) => handleChange('client_input', e.target.value)}
                placeholder="Начните вводить описание клиента..."
            />
          <small className="hint">Поиск по описанию пользователя</small>
        </div>

        <div className="form-group">
            <label htmlFor="service_company_input">Сервисная организация:</label>
            <input
                type="text"
                id="service_company_input"
                value={machine.service_company_name || ''}
                onChange={(e) => handleChange('service_company_input', e.target.value)}
                placeholder="Начните вводить описание сервисной организации..."
            />
            <small className="hint">Поиск по описанию пользователя</small>
        </div>
      </div>
    </div>

      <div className="edit-actions">
        <button
          onClick={() => navigate(-1)}
          disabled={isSaving}
        >
          Отмена
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="save-button"
        >
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
}
