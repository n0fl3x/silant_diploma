import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { DictionaryEntry } from '../types/DictionaryEntry';
import "../styles/DictEntryDetail.css";


const DictEntryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = parseInt(id || '0', 10);
  const navigate = useNavigate();

  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDictionaryEntry = async (entryId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/dict-entries/${entryId}`);

      if (!response.ok) {
        throw new Error('Ошибка загрузки элемента справочника');
      }

      const data: DictionaryEntry = await response.json();
      setEntry(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
  if (!numericId) return;

  setIsDeleting(true);
    try {
      const response = await fetch(`/api/v1/dict-entry-delete/${numericId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении элемента справочника');
      }

      navigate('/dictionary');
    } catch (error) {
      console.error('Ошибка удаления:', error);
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (numericId) {
      fetchDictionaryEntry(numericId);
    } else {
      setLoading(false);
      setError('Некорректный ID элемента');
    }
  }, [numericId]);

  if (loading) {
    return (
      <div className="loading">
        <p>Загрузка...</p>
      </div>
    );
  };

  if (error) {
    return (
      <div className="error">
        <h3>Ошибка загрузки данных</h3>
        <p>{error}</p>
        <Link to="/dictionary" className="back-link">
          ← Вернуться к списку справочников
        </Link>
      </div>
    );
  };

  if (!entry) {
    return (
      <div className="not-found">
        <h3>Элемент справочника не найден</h3>
        <Link to="/dictionary" className="back-link">
          ← Вернуться к списку справочников
        </Link>
      </div>
    );
  };

  return (
    <div className="dictionary-entry-detail">
      <div className="detail-header">
        <h1>{entry.name}</h1>
        <span className="entity-badge">{entry.entity_display}</span>
      </div>

      <div className="detail-content">
        <div className="info-grid">
          <div className="info-item">
            <label>ID элемента:</label>
            <span>{entry.id}</span>
          </div>
          <div className="info-item">
            <label>Тип справочника:</label>
            <span>{entry.entity_display}</span>
          </div>
          <div className="info-item">
            <label>Технический код (entity):</label>
            <span className="code">{entry.entity}</span>
          </div>
          <div className="info-item">
            <label>Отображаемое название:</label>
            <span>{entry.name}</span>
          </div>
        </div>

        {entry.description && (
          <div className="description">
            <h3>Описание</h3>
            <p>{entry.description}</p>
          </div>
        )}
      </div>

      <div className="actions">
        <Link
          to="/dictionary"
          className="btn btn-secondary"
        >
          ← Назад к списку справочников
        </Link>
        <Link
          to={`/dictionary-edit/${entry.id}`}
          className="btn btn-primary"
        >
          Редактировать элемент
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className={`btn ${isDeleting ? 'btn-danger-loading' : 'btn-danger'}`}
        >
          {isDeleting ? 'Удаление...' : 'Удалить элемент'}
        </button>
      </div>
    </div>
  );
};

export default DictEntryDetailPage;
