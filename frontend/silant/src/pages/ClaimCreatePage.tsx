import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/ClaimCreate.css";


interface DictionaryEntry {
  id: number;
  name: string;
}

interface MachineEntry {
  id: number;
  factory_number: string;
  model_tech_name: string;
}

const CreateClaimPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    failure_date: '',
    operating_hours: '',
    machine: '',
    failure_node: '',
    recovery_method: '',
    failure_description: '',
    spare_parts: '',
    recovery_date: ''
  });
  const [failureNodes, setFailureNodes] = useState<DictionaryEntry[]>([]);
  const [recoveryMethods, setRecoveryMethods] = useState<DictionaryEntry[]>([]);
  const [machines, setMachines] = useState<MachineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        setLoading(true);
        setError('');
        const [nodesRes, methodsRes, machinesRes] = await Promise.all([
          axios.get('/api/v1/dictionary-entries/?entity=failure_node'),
          axios.get('/api/v1/dictionary-entries/?entity=recovery_method'),
          axios.get('/api/v1/machines/')
        ]);
        setFailureNodes(nodesRes.data);
        setRecoveryMethods(methodsRes.data);
        setMachines(machinesRes.data);
      } catch (error) {
        console.error('Ошибка загрузки справочных данных:', error);
        setError('Не удалось загрузить справочные данные. Проверьте подключение к серверу.');
      } finally {
        setLoading(false);
      }
    };
    loadReferenceData();
  }, []);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const submitData = {
        failure_date: formData.failure_date,
        operating_hours: parseInt(formData.operating_hours, 10),
        machine: parseInt(formData.machine, 10),
        failure_node: parseInt(formData.failure_node, 10),
        recovery_method: formData.recovery_method
          ? parseInt(formData.recovery_method, 10)
          : null,
        failure_description: formData.failure_description,
        spare_parts: formData.spare_parts,
        recovery_date: formData.recovery_date
    };

    try {
        const response = await axios.post('/api/v1/claims/', submitData);
        alert('Рекламация успешно создана');
        navigate(`/claim-detail/${response.data.data.id}`);
    }
    catch (error: any) {
        if (error.response?.data?.errors) {
            alert('Проверьте корректность данных:\n' +
                Object.entries(error.response.data.errors)
                    .map(([field, messages]) =>
                        `${field}: ${(messages as string[]).join(', ')}`
                )
                .join('\n')
            );
        }
        else {
            alert('Ошибка при создании рекламации');
        }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="create-claim-page">
        <p>Загрузка справочных данных...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="create-claim-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="create-claim-page">
      <h1>Создать новую рекламацию</h1>
      <form onSubmit={handleSubmit} className="claim-form">
        <div className="form-group">
          <label htmlFor="failure_date">Дата отказа:</label>
          <input
            type="date"
            id="failure_date"
            name="failure_date"
            value={formData.failure_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
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

        <div className="form-group">
          <label htmlFor="machine">Машина:</label>
          <select
            id="machine"
            name="machine"
            value={formData.machine}
            onChange={handleChange}
            required
          >
            <option value="">Выберите машину</option>
            {machines.map(machine => (
              <option key={machine.id} value={machine.id}>
                {machine.factory_number} — {machine.model_tech_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="failure_node">Узел отказа:</label>
          <select
            id="failure_node"
            name="failure_node"
            value={formData.failure_node}
            onChange={handleChange}
            required
          >
            <option value="">Выберите узел отказа</option>
            {failureNodes.map(node => (
              <option key={node.id} value={node.id}>{node.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="recovery_method">Способ восстановления:</label>
          <select
            id="recovery_method"
            name="recovery_method"
            value={formData.recovery_method}
            onChange={handleChange}
          >
            <option value="">Не указан</option>
            {recoveryMethods.map(method => (
              <option key={method.id} value={method.id}>{method.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="failure_description">Описание отказа:</label>
          <textarea
            id="failure_description"
            name="failure_description"
            value={formData.failure_description}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="spare_parts">Используемые запасные части:</label>
          <textarea
            id="spare_parts"
            name="spare_parts"
            value={formData.spare_parts}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="recovery_date">Дата восстановления:</label>
          <input
            type="date"
            id="recovery_date"
            name="recovery_date"
            value={formData.recovery_date}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="submit-btn">
          Создать рекламацию
        </button>
      </form>
    </div>
  );
};

export default CreateClaimPage;
