import React from 'react';
import MachineTable from '../components/MachineTable';
import { useAuth } from '../contexts/AuthContext';

const MachineListPage: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();

  if (authLoading) {
    return <div>Проверка авторизации...</div>;
  }

  if (!isAuthenticated) {
    return <div>Для просмотра списка машин необходимо войти в систему</div>;
  }

  return (
    <div>
      <MachineTable
        onMachineSelect={(machine) => {
          console.log('Выбрана машина:', machine);
          // Здесь надо добавить логику или ещё как-то
        }}
      />
    </div>
  );
};

export default MachineListPage;
