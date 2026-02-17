import { useState, useEffect } from 'react';
import axios from 'axios';

import '/src/styles/MachineList.css';


interface Machine {
    id: number;
    factory_number: string;
    model_tech?: string;
    year_of_manufacture?: number;
};

function MachineList() {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect( () => { fetchMachines() }, [] );

    const fetchMachines = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get('/api/v1/machines/');

            if ( Array.isArray(response.data) ) {
                setMachines(response.data)
            } else {
                throw new Error('API вернул не массив')
            }
        }
        catch (err) {
            if ( err instanceof Error ) {
                setError(`Ошибка: ${err.message}`)
            }
            else {
                setError('Неизвестная ошибка')
            }
        }
        finally {
            setLoading(false)
        }
    };

    if ( loading ) {
        return <div className="loading">Загружается...</div>
    };
    
    return (
        <div className="machine-list">
            <h2>Список машин</h2>
            {error && <div className="error">{error}</div>}
            {machines.length === 0 ? (
                <p>Нет данных</p>
            ) : (
                <ul>
                {machines.map((machine) => (
                    <li key={machine.id} className="machine-item">
                    <strong>№ {machine.factory_number}</strong>
                    {machine.model_tech && <span> ({machine.model_tech})</span>}
                    {machine.year_of_manufacture && (
                        <span>, {machine.year_of_manufacture} г.</span>
                    )}
                    </li>
                ))}
                </ul>
            )}

            <button onClick={fetchMachines} disabled={loading}>
                {loading ? 'Обновление...' : 'Обновить список'}
            </button>
        </div>
    );
};

export default MachineList;
