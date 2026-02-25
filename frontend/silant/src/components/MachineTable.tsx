import React, { useState, useEffect } from 'react';
import type { Machine } from '../types/Machine';
import { fetchUserMachines } from '../services/machineService';
import Pagination from './Pagination';
import "../styles/MachineTable.css";
import "../styles/Pagination.css";

interface MachineTableProps {
  onMachineSelect?: (machine: Machine) => void;
  initialPage?: number;
  itemsPerPage?: number;
}

const MachineTable: React.FC<MachineTableProps> = ({
  onMachineSelect,
  initialPage = 1,
  itemsPerPage = 10
}) => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    const loadMachines = async () => {
      try {
        setLoading(true);
        const machinesData = await fetchUserMachines();
        setMachines(machinesData);
      } catch (err) {
        setError('Не удалось загрузить данные о машинах');
      } finally {
        setLoading(false);
      }
    };

    loadMachines();
  }, []);

  const totalPages = Math.ceil(machines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMachines = machines.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка данных о машинах...</div>;
  }

  if (error) {
    return <div className="error">Ошибка: {error}</div>;
  }

  if (machines.length === 0) {
    return <div className="no-data">У вас пока нет зарегистрированных машин</div>;
  }

  return (
    <div className="machine-table-container">
      <h2>Список машин</h2>
      <div className="table-info">
        Показаны записи {startIndex + 1}-{Math.min(endIndex, machines.length)} из {machines.length}
      </div>
      <table className="machine-table">
        <thead>
          <tr>
            <th>Заводской №</th>
            <th>Модель техники</th>
            <th>Двигатель</th>
            <th>Зав. номер двигателя</th>
            <th>Трансмиссия</th>
            <th>Номер трансмиссии</th>
            <th>Ведущий мост</th>
            <th>Номер ведущего моста</th>
            <th>Управляемый мост</th>
            <th>Номер управляемого моста</th>
            <th>Договор поставки</th>
            <th>Дата отгрузки</th>
            <th>Грузополучатель</th>
            <th>Адрес доставки</th>
            <th>Конфигурация</th>
            <th>Клиент</th>
            <th>Сервисная компания</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {paginatedMachines.map((machine) => (
            <tr key={machine.id}>
              <td>{machine.factory_number || <span className="text-muted">Не указан</span>}</td>
              <td>{machine.model_tech_name || <span className="text-muted">Не указан</span>}</td>
              <td>{machine.engine_model_name || <span className="text-muted">Не указан</span>}</td>
              <td>{machine.engine_factory_number || <span className="text-muted">Не указан</span>}</td>
              <td>{machine.transmission_model_name || <span className="text-muted">Не указан</span>}</td>
              <td>{machine.transmission_factory_number || <span className="text-muted">Не указан</span>}</td>
              <td>{machine.drive_axle_model_name || <span className="text-muted">Не указан</span>}</td>
              <td>{machine.drive_axle_factory_number || <span className="text-muted">Не указан</span>}</td>
              <td>{machine.steering_axle_model_name || <span className="text-muted">Не указан</span>}</td>
              <td>{machine.steering_axle_factory_number || <span className="text-muted">Не указан</span>}</td>
              <td>{machine.delivery_contract || <span className="text-muted">Не указан</span>}</td>
              <td>{new Date(machine.shipment_date).toLocaleDateString() || <span className="text-muted">Не указан</span>}</td>
              <td>{machine.consignee || <span className="text-muted">Не указан</span>}</td>
              <td>{machine.delivery_address || <span className="text-muted">Не указан</span>}</td>
              <td>{machine.configuration || <span className="text-muted">Не указан</span>}</td>
              <td>{machine.client_name}</td>
              <td>{machine.service_company_name}</td>
              <td>
                <button
                  onClick={() => onMachineSelect?.(machine)}
                  className="action-btn"
                >
                  Подробнее
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default MachineTable;
