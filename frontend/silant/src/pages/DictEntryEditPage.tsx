import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DictionaryEntryForm } from '../components/DictEntryForm';
import type { FormData } from '../components/DictEntryForm';
import '../styles/DictEntryForm.css';

export default function EditDictionaryEntryPage() {
  const { id } = useParams<{ id: string }>();
  const numericId = parseInt(id || '0', 10);
  const navigate = useNavigate();
  const [entry, setEntry] = useState<null | {
    id: number;
    entity: string;
    name: string;
    description: string | null;
  }>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Загрузка данных для редактирования
  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await fetch(`/api/v1/dict-entries/${numericId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Элемент не найден');
        }

        const data = await response.json();
        setEntry(data);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
        navigate('/dictionary', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [numericId, navigate]);

  // Обработка отправки формы
  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`api/v1/dict-entries/${numericId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении элемента');
      }

      // После успешного сохранения переходим на страницу детального просмотра
      navigate(`/dictionary/${numericId}`);
    } catch (error) {
      console.error('Ошибка обновления:', error);
      // Здесь можно добавить отображение ошибки пользователю
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка данных для редактирования...</div>;
  }

  if (!entry) {
    return (
      <div className="error">
        <h3>Элемент не найден</h3>
        <p>Возможно, элемент был удалён или ID указан неверно.</p>
        <button
          onClick={() => navigate('/dictionary')}
          className="btn btn-secondary"
        >
          ← Вернуться к списку справочников
        </button>
      </div>
    );
  }

  return (
    <div className="edit-dictionary-entry-page">
      <h1>Редактирование элемента справочника</h1>

      <DictionaryEntryForm
        initialData={entry}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      <div className="form-actions">
        <button
          type="button"
          onClick={() => navigate(`/dictionary/${numericId}`)}
          className="btn btn-secondary"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
