import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { ClaimItem } from '../types/Claim';
import ClaimTable from '../components/ClaimTable';
import "../styles/ClaimList.css";


const ClaimListPage: React.FC = () => {
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await axios.get<ClaimItem[]>('/api/v1/claims');

        if (Array.isArray(response.data)) {
          setClaims(response.data);
        } else {
          setError('Некорректный формат данных от сервера: ожидается массив');
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error
          ? err.message
          : 'Ошибка загрузки рекламаций';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  if (loading) return <div className="loading">Загрузка рекламаций...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="claim-list-page">
      <h1 className="claim-list-title">Список рекламаций</h1>
      <ClaimTable claims={claims} />
    </div>
  );
};

export default ClaimListPage;
