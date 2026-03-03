import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';


interface ClaimData {
    id: number;
    failure_date: string;
    operating_hours: number;
    failure_description: string;
    recovery_description: string;
    spare_parts: string;
    failure_node_id: number | null;
    recovery_method_id: number | null;
    machine_id: number;
    failure_node_name: string | null;
    recovery_method_name: string | null;
    machine_factory_number: string;
}

interface DictionaryEntry {
    id: number;
    name: string;
}

interface Machine {
    id: number;
    factory_number: string;
    model_tech_name: string;
}

export default function ClaimEditForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<ClaimData | null>(null);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [failureNodes, setFailureNodes] = useState<DictionaryEntry[]>([]);
    const [recoveryMethods, setRecoveryMethods] = useState<DictionaryEntry[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);

    useEffect(() => {
        const loadAllData = async () => {
            try {
                setLoading(true);
                setErrors({});

                const [claimResponse, nodesResponse, methodsResponse, machinesResponse] = await Promise.all([
                    fetch(`/api/v1/claims/${id}/`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                            'Content-Type': 'application/json',
                        }
                    }),
                    fetch('/api/v1/dictionary-entries/?entity=failure_node', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                            'Content-Type': 'application/json',
                        }
                    }),
                    fetch('/api/v1/dictionary-entries/?entity=recovery_method', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                            'Content-Type': 'application/json',
                        }
                    }),
                    fetch('/api/v1/machines/', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                            'Content-Type': 'application/json',
                        }
                    })
                ]);

                if (!claimResponse.ok) throw new Error('Ошибка загрузки рекламации');
                if (!nodesResponse.ok) throw new Error('Ошибка загрузки узлов отказа');
                if (!methodsResponse.ok) throw new Error('Ошибка загрузки методов восстановления');
                if (!machinesResponse.ok) throw new Error('Ошибка загрузки машин');

                const claimData: ClaimData = await claimResponse.json();
                const nodesData: DictionaryEntry[] = await nodesResponse.json();
                const methodsData: DictionaryEntry[] = await methodsResponse.json();
                const machinesData: Machine[] = await machinesResponse.json();

                setFormData(claimData);
                setFailureNodes(nodesData || []);
                setRecoveryMethods(methodsData || []);
                setMachines(machinesData || []);
            } catch (err: any) {
                console.error('Ошибка загрузки данных:', err);
                setErrors({ general: `Не удалось загрузить данные формы: ${err.message}` });
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const submitData = {
                id: formData?.id,
                failure_date: formData?.failure_date,
                operating_hours: formData?.operating_hours,
                failure_description: formData?.failure_description,
                spare_parts: formData?.spare_parts,
                failure_node_id: formData?.failure_node_id,
                recovery_method_id: formData?.recovery_method_id,
                machine_id: formData?.machine_id
            };

            const response = await fetch(`/api/v1/claims/${id}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData)
            });

            if (response.ok) {
                const updatedData = await response.json();
                setFormData(updatedData);
                navigate('/claims');
            } else {
                const errorData = await response.json();
                setErrors(errorData.errors || {});
            }
        } catch (err) {
            console.error('Ошибка при сохранении:', err);
            setErrors({ general: 'Ошибка при сохранении данных' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? {
            ...prev,
            [name]: name === 'operating_hours' ? parseInt(value) : value
        } : null);

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="claim-edit-form">
                <div className="loading-indicator">
                    <div className="spinner"></div>
                    <p>Загрузка данных формы...</p>
                </div>
            </div>
        );
    }

    if (errors.general) {
        return (
            <div className="claim-edit-form">
                <div className="error-message general">{errors.general}</div>
                <button onClick={handleCancel} className="btn btn-secondary">
                    Вернуться назад
                </button>
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="claim-edit-form">
                <div className="error-message">Не удалось загрузить данные рекламации</div>
                <button onClick={handleCancel} className="btn btn-secondary">
                    Вернуться к списку
                </button>
            </div>
        );
    }

    return (
        <div className="claim-edit-form">
            <h2>Редактирование рекламации #{formData.id}</h2>

            {errors.general && (
                <div className="error-message general">{errors.general}</div>
            )}

            <form onSubmit={handleSubmit} className="form-grid">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="failure_date">Дата отказа *</label>
                        <input
                            type="date"
                            id="failure_date"
                            name="failure_date"
                            value={formData.failure_date}
                            onChange={handleChange}
                            required
                            className={errors.failure_date ? 'input-error' : ''}
                        />
                        {errors.failure_date && <span className="error-message">{errors.failure_date}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="operating_hours">Наработка, моточасы *</label>
                        <input
                            type="number"
                            id="operating_hours"
                            name="operating_hours"
                            value={formData.operating_hours}
                            onChange={handleChange}
                            min="0"
                            required
                            className={errors.operating_hours ? 'input-error' : ''}
                        />
                        {errors.operating_hours && <span className="error-message">{errors.operating_hours}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="machine_id">Машина *</label>
                        <select
                            id="machine_id"
                            name="machine_id"
                            value={formData.machine_id}
                            onChange={handleChange}
                            className={errors.machine_id ? 'input-error' : ''}
                            required
                        >
                            <option value="">Выберите машину</option>
                            {machines.map(machine => (
                                <option key={machine.id} value={machine.id}>
                                    {machine.factory_number} - {machine.model_tech_name}
                                </option>
                            ))}
                        </select>
                        {errors.machine_id && <span className="error-message">{errors.machine_id}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="failure_node_id">Узел отказа</label>
                        <select
                            id="failure_node_id"
                            name="failure_node_id"
                            value={formData.failure_node_id || ''}
                            onChange={handleChange}
                            className={errors.failure_node_id ? 'input-error' : ''}
                        >
                            <option value="">Не указан</option>
                            {failureNodes.map(node => (
                                <option key={node.id} value={node.id}>
                                    {node.name}
                                </option>
                            ))}
                        </select>
                        {errors.failure_node_id && <span className="error-message">{errors.failure_node_id}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="recovery_method_id">Способ восстановления</label>
                        <select
                            id="recovery_method_id"
                            name="recovery_method_id"
                            value={formData.recovery_method_id || ''}
                            onChange={handleChange}
                            className={errors.recovery_method_id ? 'input-error' : ''}
                        >
                            <option value="">Не указан</option>
                            {recoveryMethods.map(method => (
                                <option key={method.id} value={method.id}>
                                    {method.name}
                                </option>
                            ))}
                        </select>
                        {errors.recovery_method_id && <span className="error-message">{errors.recovery_method_id}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group full-width">
                        <label htmlFor="failure_description">Описание отказа *</label>
                        <textarea
                            id="failure_description"
                            name="failure_description"
                            value={formData.failure_description}
                            onChange={handleChange}
                            rows={3}
                            required
                            className={errors.failure_description ? 'input-error' : ''}
                        />
                        {errors.failure_description && <span className="error-message">{errors.failure_description}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group full-width">
                        <label htmlFor="spare_parts">Использованные запчасти</label>
                        <textarea
                            id="spare_parts"
                            name="spare_parts"
                            value={formData.spare_parts}
                            onChange={handleChange}
                            rows={2}
                            className={errors.spare_parts ? 'input-error' : ''}
                        />
                        {errors.spare_parts && <span className="error-message">{errors.spare_parts}</span>}
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="btn btn-secondary"
                    >
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
};
