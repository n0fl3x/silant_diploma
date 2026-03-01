import React, { useState, useEffect } from 'react';

// Тип для данных формы
export interface FormData {
  entity: string;
  name: string;
  description: string | null;
}

interface DictionaryEntryFormProps {
  initialData?: {
    id?: number;
    entity?: string;
    name?: string;
    description?: string | null;
  };
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

const ENTITY_CHOICES = [
  { value: "machine_model", label: "Модель техники" },
  { value: "engine_model", label: "Модель двигателя" },
  { value: "transmission_model", label: "Модель трансмиссии" },
  { value: "steering_axle_model", label: "Модель управляемого моста" },
  { value: "drive_axle_model", label: "Модель ведущего моста" },
  { value: "maintenance_type", label: "Вид ТО" },
  { value: "failure_node", label: "Узел отказа" },
  { value: "recovery_method", label: "Способ восстановления" },
] as const;

export const DictionaryEntryForm: React.FC<DictionaryEntryFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    entity: initialData?.entity || '',
    name: initialData?.name || '',
    description: initialData?.description || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        entity: initialData.entity || '',
        name: initialData.name || '',
        description: initialData.description || ''
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.entity) {
      newErrors.entity = 'Выберите тип справочника';
    }
    if (!formData.name) {
      newErrors.name = 'Введите наименование';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Наименование не должно превышать 100 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        entity: formData.entity,
        name: formData.name,
        description: formData.description || null
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="dictionary-entry-form">
      <div className="form-group">
        <label htmlFor="entity">Тип справочника *</label>
        <select
          id="entity"
          name="entity"
          value={formData.entity}
          onChange={handleChange}
          className={errors.entity ? 'input-error' : ''}
        >
          <option value="">Выберите тип справочника</option>
          {ENTITY_CHOICES.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
        {errors.entity && <span className="error-message">{errors.entity}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="name">Наименование *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          maxLength={100}
          className={errors.name ? 'input-error' : ''}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
        <div className="char-counter">
          {formData.name.length}/100
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Описание</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder="Введите подробное описание (необязательно)"
        />
      </div>

      <div className="form-actions">
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? 'Сохранение...' : (initialData?.id ? 'Обновить' : 'Создать')}
        </button>
      </div>
    </form>
  );
};
