import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import "../styles/ClaimDetail.css";
import axios from 'axios';

const ClaimDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<null | any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userGroup, setUserGroup] = useState<string | null>(null);

  useEffect(() => {
    const loadClaim = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`/api/v1/claims/${id}/`);
        setClaim(response.data);
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            setError('Рекламация не найдена');
          } else {
            setError(`Ошибка загрузки: ${err.message}`);
          }
        } else {
          setError('Неизвестная ошибка при загрузке данных');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadClaim();
    }
  }, [id]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await axios.get('/api/v1/user');
        setUserGroup(response.data.group_name);
      } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
        setUserGroup('client');
      }
    };
    loadUserData();
  }, []);

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить эту рекламацию?')) {
      return;
    }

    try {
      await axios.delete(`/api/v1/claims/${id}/`);
      alert('Рекламация успешно удалена');
      navigate('/claims');
    } catch (error) {
      alert('Ошибка при удалении рекламации');
    }
  };

  if (loading) {
    return (
      <div className="claim-detail-page">
        <div className="claim-detail-loading">Загрузка данных...</div>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="claim-detail-page">
        <div className="claim-detail-error">{error || 'Рекламация не найдена'}</div>
      </div>
    );
  }

  return (
    <div className="claim-detail-page">
      <div className="claim-card">
        <div className="claim-card-header">
          <h1 className="claim-card-title">Рекламация #{claim.id}</h1>
          <div className="claim-card-actions">
            <Link to="/claims" className="claim-card-back-link">
              ← Вернуться к списку
            </Link>
            {userGroup !== 'client' && (
              <button
                onClick={handleDelete}
                className="claim-card-delete-btn"
              >
                Удалить рекламацию
              </button>
            )}
          </div>
        </div>

        <div className="claim-card-body">
          <div className="claim-field">
            <span className="claim-label">ID: </span>
            <span className="claim-value">{claim.id}</span>
          </div>

          <div className="claim-field">
            <span className="claim-label">Дата отказа: </span>
            <span className="claim-value">
              {new Date(claim.failure_date).toLocaleDateString()}
            </span>
          </div>

          <div className="claim-field">
            <span className="claim-label">Наработка, м/час: </span>
            <span className="claim-value">{claim.operating_hours}</span>
          </div>

          <div className="claim-field">
            <span className="claim-label">Время простоя, дней: </span>
            <span className="claim-value">{claim.downtime_days}</span>
          </div>

          <div className="claim-field claim-field--linked">
            <span className="claim-label">Машина: </span>
            <Link
              to={`/machine-detail/${claim.machine}`}
              className="claim-link claim-link--machine"
            >
              {claim.machine_factory_number}
            </Link>
          </div>

          <div className="claim-field claim-field--linked">
            <span className="claim-label">Узел отказа: </span>
            <Link
              to={`/dictionary/${claim.failure_node}`}
              className="claim-link claim-link--node"
            >
              {claim.failure_node_name}
            </Link>
          </div>

          {claim.recovery_method && (
            <div className="claim-field claim-field--linked">
              <span className="claim-label">Способ восстановления: </span>
              <Link
                to={`/dictionary/${claim.recovery_method}`}
                className="claim-link claim-link--method"
              >
                {claim.recovery_method_name}
              </Link>
            </div>
          )}

          {claim.description && (
            <div className="claim-field claim-field--description">
              <span className="claim-label">Описание проблемы: </span>
              <div className="claim-description">{claim.description}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimDetailPage;
