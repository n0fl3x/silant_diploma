import React from 'react';
import type { ClaimItem } from '../types/Claim';
import "../styles/ClaimList.css";

interface ClaimTableProps {
  claims: ClaimItem[];
}

const ClaimTable: React.FC<ClaimTableProps> = ({ claims }) => {
  return (
    <table className="claims-table">
      <thead>
        <tr className="claims-table-header">
          <th>ID</th>
          <th>Дата отказа</th>
          <th>Наработка, м/час</th>
          <th>Узел отказа</th>
          <th>Машина</th>
          <th>Время простоя, дней</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        {claims.length === 0 ? (
          <tr>
            <td colSpan={7} className="no-data-cell">
              Рекламации не найдены
            </td>
          </tr>
        ) : (
          claims.map(item => (
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
  );
};

export default ClaimTable;
