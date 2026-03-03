import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import type { MaintenanceItem } from '../types/MaintenanceItem';

const MaintenanceTable: React.FC = () => {
  const [maintenances, setMaintenances] = useState<MaintenanceItem[]>([]);
  const [filteredMaintenances, setFilteredMaintenances] = useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    maintenance_type: '',
    machine_factory_number: '',
    service_company: ''
  });

  useEffect(() => {
    const fetchMaintenances = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('/api/v1/maintenance', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setMaintenances(response.data.data);
          setFilteredMaintenances(response.data.data);
        } else {
          setError('Не удалось загрузить данные ТО');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка загрузки данных ТО');
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenances();
  }, []);

  useEffect(() => {
    let filtered = maintenances;

    if (filters.maintenance_type) {
      filtered = filtered.filter(item =>
        item.maintenance_type?.name &&
        typeof item.maintenance_type.name === 'string' &&
        item.maintenance_type.name
          .toLowerCase()
          .includes(filters.maintenance_type.toLowerCase())
      );
    }

    if (filters.machine_factory_number) {
      filtered = filtered.filter(item =>
        item.machine?.factory_number &&
        typeof item.machine.factory_number === 'string' &&
        item.machine.factory_number
          .toLowerCase()
          .includes(filters.machine_factory_number.toLowerCase())
      );
    }

    if (filters.service_company) {
      filtered = filtered.filter(item =>
        item.service_company?.description &&
        typeof item.service_company.description === 'string' &&
        item.service_company.description
          .toLowerCase()
          .includes(filters.service_company.toLowerCase())
      );
    }

    setFilteredMaintenances(filtered);
  }, [filters, maintenances]);

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className="maintenance-table-loading">Загрузка данных...</div>;
  if (error) return <div className="maintenance-table-error">Ошибка: {error}</div>;

  return (
    <div className="maintenance-table-container">
      <div className="maintenance-filters">
        <h2>Фильтры</h2>
        <div className="filters-grid">
          <div className="filter-field">
            <label htmlFor="filter-maintenance-type">Вид ТО:</label>
            <input
              id="filter-maintenance-type"
              type="text"
              placeholder="Введите вид ТО"
              value={filters.maintenance_type}
              onChange={(e) => handleFilterChange('maintenance_type', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-field">
            <label htmlFor="filter-machine-number">Заводской номер машины:</label>
            <input
              id="filter-machine-number"
              type="text"
              placeholder="Введите заводской номер"
              value={filters.machine_factory_number}
              onChange={(e) => handleFilterChange('machine_factory_number', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-field">
            <label htmlFor="filter-service-company">Сервисная компания:</label>
            <input
              id="filter-service-company"
              type="text"
              placeholder="Введите название компании"
              value={filters.service_company}
              onChange={(e) => handleFilterChange('service_company', e.target.value)}
              className="filter-input"
            />
          </div>
        </div>
      </div>

      <table className="maintenance-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Дата проведения</th>
            <th>Наработка (м/час)</th>
            <th>Вид ТО</th>
            <th>Заводской номер машины</th>
            <th>Сервисная компания</th>
            <th>№ заказ-наряда</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {filteredMaintenances.length === 0 ? (
            <tr>
              <td colSpan={8} className="no-data">
                Данные не найдены по заданным фильтрам
              </td>
            </tr>
          ) : (
            filteredMaintenances.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{new Date(item.maintenance_date).toLocaleDateString()}</td>
                <td>{item.operating_hours}</td>
                <td>
                  <Link
                    to={`/dictionary/${item.maintenance_type?.id}`}
                    className="table-link"
                  >
                    {item.maintenance_type?.name || 'Не указано'}
                  </Link>
                </td>
                <td>
                  <Link
                    to={`/machine-detail/${item.machine?.id}`}
                    className="table-link"
                  >
                    {item.machine?.factory_number || 'Не указан'}
                  </Link>
                </td>
                <td>{item.service_company?.description || 'Не указана'}</td>
                <td>{item.work_order_number || '-'}</td>
                <td>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => window.location.href = `/maintenance/${item.id}`}
                  >
                    Подробнее
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MaintenanceTable;
