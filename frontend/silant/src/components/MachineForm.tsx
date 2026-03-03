import React from 'react';
import type { Machine } from '../types/Machine';

interface MachineFormProps {
  initialData?: Partial<Machine>;
  onSubmit: (data: MachineSubmitData) => Promise<void>;
  isLoading?: boolean;
}

export interface MachineSubmitData {
  factory_number: string;
  model_tech_id: number | null;
  engine_model_id: number | null;
  engine_factory_number: string;
  transmission_model_id: number | null;
  transmission_factory_number: string;
  drive_axle_model_id: number | null;
  drive_axle_factory_number: string;
  steering_axle_model_id: number | null;
  steering_axle_factory_number: string;
  delivery_contract: string;
  shipment_date: string;
  consignee: string;
  delivery_address: string;
  configuration: string;
  client_input: string | null;
  service_company_input: string | null;
}

const MachineForm: React.FC<MachineFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = React.useState<MachineSubmitData>({
    factory_number: initialData.factory_number || '',
    model_tech_id: initialData.model_tech?.id || null,
    engine_model_id: initialData.engine_model?.id || null,
    engine_factory_number: initialData.engine_factory_number || '',
    transmission_model_id: initialData.transmission_model?.id || null,
    transmission_factory_number: initialData.transmission_factory_number || '',
    drive_axle_model_id: initialData.drive_axle_model?.id || null,
    drive_axle_factory_number: initialData.drive_axle_factory_number || '',
    steering_axle_model_id: initialData.steering_axle_model?.id || null,
    steering_axle_factory_number: initialData.steering_axle_factory_number || '',
    delivery_contract: initialData.delivery_contract || '',
    shipment_date: initialData.shipment_date || '',
    consignee: initialData.consignee || '',
    delivery_address: initialData.delivery_address || '',
    configuration: initialData.configuration || '',
    client_input: initialData.client_name || null,
    service_company_input: initialData.service_company_name || null
  });


  const handleChange = (field: keyof MachineSubmitData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="machine-form">
      <div className="form-section">
        <h3>Основные данные машины</h3>
        <div className="form-group">
          <label htmlFor="factory_number">Заводской номер машины:</label>
          <input
            type="text"
            id="factory_number"
            value={formData.factory_number}
            onChange={(e) => handleChange('factory_number', e.target.value)}
            placeholder="Введите заводской номер"
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="model_tech">Модель техники:</label>
          <select
            id="model_tech"
            value={formData.model_tech_id || ''}
            onChange={(e) => handleChange('model_tech_id', e.target.value ? parseInt(e.target.value) : null)}
            disabled={isLoading}
          >
            <option value="">Выберите модель техники</option>
            {initialData.model_tech_options?.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <small className="hint">Будет выполнен поиск в справочнике моделей техники</small>
        </div>
      </div>

      <div className="form-section">
        <h3>Компоненты машины</h3>
        <div className="form-group">
          <label htmlFor="engine_model">Модель двигателя:</label>
          <select
            id="engine_model"
            value={formData.engine_model_id || ''}
            onChange={(e) => handleChange('engine_model_id', e.target.value ? parseInt(e.target.value) : null)}
            disabled={isLoading}
          >
            <option value="">Выберите модель двигателя</option>
            {initialData.engine_model_options?.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <small className="hint">Поиск в справочнике моделей двигателей</small>
        </div>
        <div className="form-group">
          <label htmlFor="engine_factory_number">Зав. № двигателя:</label>
          <input
            type="text"
            id="engine_factory_number"
            value={formData.engine_factory_number}
            onChange={(e) => handleChange('engine_factory_number', e.target.value)}
            placeholder="Введите заводской номер двигателя"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="transmission_model">Модель трансмиссии:</label>
          <select
            id="transmission_model"
            value={formData.transmission_model_id || ''}
            onChange={(e) => handleChange('transmission_model_id', e.target.value ? parseInt(e.target.value) : null)}
            disabled={isLoading}
          >
            <option value="">Выберите модель трансмиссии</option>
            {initialData.transmission_model_options?.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <small className="hint">Поиск в справочнике моделей трансмиссий</small>
        </div>
        <div className="form-group">
          <label htmlFor="transmission_factory_number">Зав. № трансмиссии:</label>
          <input
            type="text"
            id="transmission_factory_number"
            value={formData.transmission_factory_number}
            onChange={(e) => handleChange('transmission_factory_number', e.target.value)}
            placeholder="Введите заводской номер трансмиссии"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="drive_axle_model">Модель ведущего моста:</label>
          <select
            id="drive_axle_model"
            value={formData.drive_axle_model_id || ''}
            onChange={(e) => handleChange('drive_axle_model_id', e.target.value ? parseInt(e.target.value) : null)}
            disabled={isLoading}
          >
            <option value="">Выберите модель ведущего моста</option>
            {initialData.drive_axle_model_options?.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <small className="hint">Поиск в справочнике моделей ведущих мостов</small>
        </div>
        <div className="form-group">
          <label htmlFor="drive_axle_factory_number">Зав. номер ведущего моста:</label>
          <input
            type="text"
            id="drive_axle_factory_number"
            value={formData.drive_axle_factory_number || ''}
            onChange={(e) => handleChange('drive_axle_factory_number', e.target.value)}
            placeholder="Введите заводской номер ведущего моста..."
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="steering_axle_model">Модель управляемого моста:</label>
          <select
            id="steering_axle_model"
            value={formData.steering_axle_model_id || ''}
            onChange={(e) => handleChange('steering_axle_model_id', e.target.value ? parseInt(e.target.value) : null)}
            disabled={isLoading}
          >
            <option value="">Выберите модель управляемого моста</option>
            {initialData.steering_axle_model_options?.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <small className="hint">Поиск в справочнике моделей управляемых мостов</small>
        </div>
        <div className="form-group">
          <label htmlFor="steering_axle_factory_number">Зав. номер управляемого моста:</label>
          <input
            type="text"
            id="steering_axle_factory_number"
            value={formData.steering_axle_factory_number || ''}
            onChange={(e) => handleChange('steering_axle_factory_number', e.target.value)}
            placeholder="Введите заводской номер управляемого моста..."
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Логистика и комплектация</h3>
        <div className="form-group">
          <label htmlFor="shipment_date">Дата отгрузки с завода:</label>
          <input
            type="date"
            id="shipment_date"
            value={formData.shipment_date}
            onChange={(e) => handleChange('shipment_date', e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="delivery_contract">Договор поставки №, дата:</label>
          <input
            type="text"
            id="delivery_contract"
            value={formData.delivery_contract}
            onChange={(e) => handleChange('delivery_contract', e.target.value)}
            placeholder="Номер и дата договора"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="consignee">Грузополучатель (конечный потребитель):</label>
          <input
            type="text"
            id="consignee"
            value={formData.consignee}
            onChange={(e) => handleChange('consignee', e.target.value)}
            placeholder="Наименование грузополучателя"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="delivery_address">Адрес поставки (эксплуатации):</label>
          <textarea
            id="delivery_address"
            value={formData.delivery_address}
            onChange={(e) => handleChange('delivery_address', e.target.value)}
            placeholder="Полный адрес поставки"
            rows={3}
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="configuration">Комплектация (доп. опции):</label>
          <textarea
            id="configuration"
            value={formData.configuration}
            onChange={(e) => handleChange('configuration', e.target.value)}
            placeholder="Описание комплектации и дополнительных опций"
            rows={4}
            disabled={isLoading}
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
            value={formData.client_input || ''}
            onChange={(e) => handleChange('client_input', e.target.value)}
            placeholder="Начните вводить описание клиента..."
            disabled={isLoading}
          />
          <small className="hint">Поиск по описанию пользователя</small>
        </div>
        <div className="form-group">
          <label htmlFor="service_company_input">Сервисная организация:</label>
          <input
            type="text"
            id="service_company_input"
            value={formData.service_company_input || ''}
            onChange={(e) => handleChange('service_company_input', e.target.value)}
            placeholder="Начните вводить описание сервисной организации..."
            disabled={isLoading}
          />
          <small className="hint">Поиск по описанию пользователя</small>
        </div>
      </div>

      <div className="edit-actions">
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="save-button"
        >
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </form>
  );
};

export default MachineForm;
