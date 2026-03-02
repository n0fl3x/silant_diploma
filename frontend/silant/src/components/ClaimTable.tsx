import React, { useState, useEffect } from 'react';
import type { ClaimItem } from '../types/Claim';
import "../styles/ClaimList.css";

interface ClaimTableProps {
  claims: ClaimItem[];
}

const ClaimTable: React.FC<ClaimTableProps> = ({ claims }) => {
  const [filteredClaims, setFilteredClaims] = useState<ClaimItem[]>(claims);
  const [filters, setFilters] = useState({
    failure_node: '',
    recovery_method: '',
    service_company: '',
  });

  useEffect(() => {
    let filtered = claims;

    if (filters.failure_node) {
      filtered = filtered.filter(item =>
        item.failure_node_name
          .toLowerCase()
          .includes(filters.failure_node.toLowerCase())
      );
    }

    if (filters.recovery_method) {
      filtered = filtered.filter(item =>
        item.recovery_method_name &&
        item.recovery_method_name
          .toLowerCase()
          .includes(filters.recovery_method.toLowerCase())
      );
    }

    if (filters.service_company) {
      filtered = filtered.filter(item =>
        typeof item.service_company_description === 'string' &&
        item.service_company_description?.toLowerCase().includes(filters.service_company.toLowerCase())
      );
    }

    setFilteredClaims(filtered);
  }, [claims, filters]);


  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="claim-table-container">
      <div className="filters-container">
        <div className="filter-field">
          <label htmlFor="filter-failure-node">Узел отказа:</label>
          <input
            id="filter-failure-node"
            type="text"
            placeholder="Введите узел отказа"
            value={filters.failure_node}
            onChange={(e) => handleFilterChange('failure_node', e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-field">
          <label htmlFor="filter-recovery-method">Способ восстановления:</label>
          <input
            id="filter-recovery-method"
            type="text"
            placeholder="Введите способ восстановления"
            value={filters.recovery_method}
            onChange={(e) => handleFilterChange('recovery_method', e.target.value)}
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

      <table className="claims-table">
        <thead>
          <tr className="claims-table-header">
            <th>ID</th>
            <th>Дата отказа</th>
            <th>Наработка, м/час</th>
            <th>Узел отказа</th>
            <th>Способ восстановления</th>
            <th>Сервисная компания</th>
            <th>Машина</th>
            <th>Время простоя, дней</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {filteredClaims.length === 0 ? (
            <tr>
              <td colSpan={8} className="no-data-cell">
                Данные не найдены по заданным фильтрам
              </td>
            </tr>
          ) : (
            filteredClaims.map(item => (
              <tr key={item.id} className="claims-table-row">
                <td className="claims-table-cell">{item.id}</td>
                <td className="claims-table-cell">
                  {new Date(item.failure_date).toLocaleDateString()}
                </td>
                <td className="claims-table-cell">{item.operating_hours}</td>
                <td className="claims-table-cell">
                  <a
                    href={`/dictionary/${item.failure_node}`}
                    className="table-link"
                  >
                    {item.failure_node_name || 'Не указан'}
                  </a>
                </td>
                <td className="claims-table-cell">
                  {item.recovery_method_name || 'Не указан'}
                </td>
                <td className="claims-table-cell">
                  {item.service_company_description}
                </td>
                <td className="claims-table-cell">
                  <a
                    href={`/machine-detail/${item.machine}`}
                    className="table-link"
                  >
                    {item.machine_factory_number || 'Не указана'}
                  </a>
                </td>
                <td className="claims-table-cell">{item.downtime_days}</td>
                <td className="claims-table-cell">
                  <button
                    className="action-btn view-btn"
                    onClick={() => window.location.href = `/claim-detail/${item.id}`}
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

export default ClaimTable;
