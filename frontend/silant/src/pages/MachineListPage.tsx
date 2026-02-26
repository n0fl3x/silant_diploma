import React from 'react';
import { useNavigate } from 'react-router-dom';
import MachineTable from '../components/MachineTable';
import { useAuth } from '../contexts/AuthContext';

const MachineListPage: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (authLoading) {
    return <div>Проверка авторизации...</div>;
  }

  if (!isAuthenticated) {
    return <div>Для просмотра списка машин необходимо войти в систему</div>;
  }

  return (
    <div className="machine-list-page">
      <MachineTable
        onMachineSelect={(machine) => {
          navigate(`/machine-detail/${machine.id}`);
        }}
      />
    </div>
  );
};

export default MachineListPage;
