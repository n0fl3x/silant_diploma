import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MaintenanceList = () => {
  const [maintenanceData, setMaintenanceData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null); // новое поле
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('/api/v1/maintenance', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success && Array.isArray(response.data.data)) {
          setMaintenanceData(response.data.data);
          setTotalCount(response.data.count); // сохраняем общее количество
        } else {
          setError('Некорректный формат данных от сервера');
        }
      } catch (err: any) {
        let errorMessage = 'Ошибка загрузки данных ТО';

        if (err.response) {
          errorMessage = `Ошибка сервера: ${err.response.status}`;
        } else if (err.request) {
          errorMessage = 'Нет соединения с сервером';
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenance();
  }, []);

  if (loading) return <div className="loading">Загрузка данных ТО...</div>;
  if (error) return <div className="error">{error}</div>;

  if (!Array.isArray(maintenanceData)) {
    return <div className="error">Данные недоступны или имеют неверный формат</div>;
  }

  return (
    <div className="maintenance-list">
      <h2>Список технических обслуживаний</h2>
      <p>Всего записей: {maintenanceData.length} из {totalCount || 'N/A'}</p>
      {maintenanceData.length === 0 ? (
        <p>Нет данных о ТО для отображения</p>
      ) : (
        <table className="maintenance-table">
          <thead>
            <tr>
              <th>Действия</th>
              <th>Дата ТО</th>
              <th>Машина</th>
              <th>Модель машины</th>
              <th>Наработка (м/час)</th>
              <th>Вид ТО</th>
              <th>Сервисная компания</th>
              <th>№ заказ‑наряда</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceData.map((maintenance) => (
              <tr key={maintenance.id}>
                <td>
                    <Link
                        to={`/maintenance/${maintenance.id}`}
                        className="maintenance-table__action-btn"
                    >
                        Подробнее
                    </Link>
                </td>
                <td>{maintenance.maintenance_date}</td>
                <td>
                  <Link to={`/machine-detail/${maintenance.machine.id}`}>
                    {maintenance.machine.factory_number}
                  </Link>
                </td>
                <td>
                  <Link to={`/dictionary/${maintenance.machine.model_tech_id}`}>
            {maintenance.machine.model_tech_name}
                  </Link>
                </td>
                <td>{maintenance.operating_hours}</td>
                <td>
                  <Link to={`/dictionary/${maintenance.maintenance_type.id}`}>
            {maintenance.maintenance_type.name}
                  </Link>
                </td>
                <td>{maintenance.service_company.description || 'Неизвестно'}</td>
                <td>{maintenance.work_order_number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MaintenanceList;
