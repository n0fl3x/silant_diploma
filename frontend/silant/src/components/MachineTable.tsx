import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Machine } from '../types/Machine';
import type { MachineTableProps } from '../types/MachineTableProps';
import { fetchUserMachines } from '../services/machineService';
import Pagination from './Pagination';
import "../styles/MachineTable.css";
import "../styles/Pagination.css";
import { DictionaryLink } from '../components/DictionaryLink';

// FilterPanel вынесен за пределы MachineTable
const FilterPanel: React.FC<{
  filters: {
    modelTech: string | null;
    engineModel: string | null;
    transmissionModel: string | null;
    steeringAxleModel: string | null;
    driveAxleModel: string | null;
  };
  onFilterChange: (field: string, value: string) => void;
  onReset: () => void;
}> = ({ filters, onFilterChange, onReset }) => (
  <div className="filter-panel">
    <div className="filter-group">
      <label>Модель техники:</label>
      <input
        type="text"
        value={filters.modelTech || ''}
        onChange={(e) => onFilterChange('modelTech', e.target.value)}
        placeholder="Поиск по модели..."
      />
    </div>
    <div className="filter-group">
      <label>Модель двигателя:</label>
      <input
        type="text"
        value={filters.engineModel || ''}
        onChange={(e) => onFilterChange('engineModel', e.target.value)}
        placeholder="Поиск по модели..."
      />
    </div>
    <div className="filter-group">
      <label>Модель трансмиссии:</label>
      <input
        type="text"
        value={filters.transmissionModel || ''}
        onChange={(e) => onFilterChange('transmissionModel', e.target.value)}
        placeholder="Поиск по модели..."
      />
    </div>
    <div className="filter-group">
      <label>Модель управляемого моста:</label>
      <input
        type="text"
        value={filters.steeringAxleModel || ''}
        onChange={(e) => onFilterChange('steeringAxleModel', e.target.value)}
        placeholder="Поиск по модели..."
      />
    </div>
    <div className="filter-group">
      <label>Модель ведущего моста:</label>
      <input
        type="text"
        value={filters.driveAxleModel || ''}
        onChange={(e) => onFilterChange('driveAxleModel', e.target.value)}
        placeholder="Поиск по модели..."
      />
    </div>
    <button
      className="btn btn-reset"
      onClick={onReset}
    >
      Сбросить фильтры
    </button>
  </div>
);

const MachineTable: React.FC<MachineTableProps> = (props) => {
  // Деструктуризация пропсов
  const {
    onMachineSelect,
    initialPage = 1,
    itemsPerPage = 10,
    filterModelTech,
    filterEngineModel,
    filterTransmissionModel,
    filterSteeringAxleModel,
    filterDriveAxleModel,
    onFilterChange
  } = props;

  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Состояние фильтров
  const [filters, setFilters] = useState({
    modelTech: filterModelTech || null,
    engineModel: filterEngineModel || null,
    transmissionModel: filterTransmissionModel || null,
    steeringAxleModel: filterSteeringAxleModel || null,
    driveAxleModel: filterDriveAxleModel || null
  });

  // Функции обработки фильтров с useCallback для стабильности ссылок
  const handleFilterChange = useCallback((field: string, value: string) => {
    const newFilters = {
      ...filters,
      [field]: value.trim() === '' ? null : value
    };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [filters, onFilterChange]);

  const handleResetFilters = useCallback(() => {
    const resetFilters = {
      modelTech: null,
      engineModel: null,
      transmissionModel: null,
      steeringAxleModel: null,
      driveAxleModel: null
    };
    setFilters(resetFilters);
    onFilterChange?.(resetFilters);
  }, [onFilterChange]);

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

  // Логика фильтрации
  const filteredMachines = useMemo(() => {
    return machines.filter(machine => {
      // Модель техники
      if (filters.modelTech &&
          !machine.model_tech?.name?.toLowerCase().includes(filters.modelTech.toLowerCase())) {
        return false;
      }
      // Модель двигателя
      if (filters.engineModel &&
          !machine.engine_model?.name?.toLowerCase().includes(filters.engineModel.toLowerCase())) {
        return false;
      }
      // Модель трансмиссии
      if (filters.transmissionModel &&
          !machine.transmission_model?.name?.toLowerCase().includes(filters.transmissionModel.toLowerCase())) {
        return false;
      }
      // Модель управляемого моста
      if (filters.steeringAxleModel &&
          !machine.steering_axle_model?.name?.toLowerCase().includes(filters.steeringAxleModel.toLowerCase())) {
        return false;
      }
      // Модель ведущего моста
      if (filters.driveAxleModel &&
          !machine.drive_axle_model?.name?.toLowerCase().includes(filters.driveAxleModel.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [machines, filters]);

  // Пагинация отфильтрованных данных
  const totalPages = Math.ceil(filteredMachines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMachines = filteredMachines.slice(startIndex, endIndex);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

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

      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <div className="table-info">
        Показаны записи {startIndex + 1}-{Math.min(endIndex, filteredMachines.length)} из {filteredMachines.length}
      </div>

      <table className="machine-table">
        <thead>
          <tr>
            <th>Заводской №</th>
            <th>Действия</th>
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
          </tr>
        </thead>
        <tbody>
          {paginatedMachines.map((machine: Machine) => (
            <tr key={machine.id}>
              <td>{machine.factory_number || <span className="text-muted">Не указан</span>}</td>
              <td>
                <button
                  onClick={() => onMachineSelect?.(machine)}
                  className="action-btn"
                >
                  Подробнее
                </button>
              </td>
              <td>
                <DictionaryLink
                  id={machine.model_tech?.id}
                  name={machine.model_tech?.name}
                />
              </td>
              <td>
                <DictionaryLink
                  id={machine.engine_model?.id}
                  name={machine.engine_model?.name}
                />
              </td>
              <td>{machine.engine_factory_number || <span className="text-muted">Не указан</span>}</td>
              <td>
                <DictionaryLink
                  id={machine.transmission_model?.id}
                  name={machine.transmission_model?.name}
                />
              </td>
              <td>{machine.transmission_factory_number || <span className="text-muted">Не указан</span>}</td>
              <td>
                <DictionaryLink
                  id={machine.drive_axle_model?.id}
                  name={machine.drive_axle_model?.name}
                />
              </td>
              <td>{machine.drive_axle_factory_number || <span className="text-muted">Не указан</span>}</td>
              <td>
                <DictionaryLink
                  id={machine.steering_axle_model?.id}
                  name={machine.steering_axle_model?.name}
                />
              </td>
              <td>{machine.steering_axle_factory_number || <span className="text-muted">Не указан</span>}</td>
              <td>{machine.delivery_contract || <span className="text-muted">Не указан</span>}</td>
              <td>
                {machine.shipment_date
                  ? new Date(machine.shipment_date).toLocaleDateString()
                  : <span className="text-muted">Не указан</span>}
              </td>
              <td>{machine.consignee || <span className="text-muted">Не указан</span>}</td>
              <td>{machine.delivery_address || <span className="text-muted">Не указан</span>}</td>
              <td>{machine.configuration || <span className="text-muted">Не указан</span>}</td>
              <td>{machine.client_name || <span className="text-muted">Не указан</span>}</td>
              <td>{machine.service_company_name || <span className="text-muted">Не указана</span>}</td>
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
