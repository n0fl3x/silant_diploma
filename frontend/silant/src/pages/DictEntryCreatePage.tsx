import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DictionaryEntryForm } from '../components/DictEntryForm';
import type { FormData } from '../components/DictEntryForm';
import '../styles/DictEntryForm.css';

export default function CreateDictionaryEntryPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/dict-entry-create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Ошибка при создании элемента');
      }

      const result = await response.json();
      navigate(`/dictionary/${result.data.id}`);
    } catch (error) {
      console.error('Ошибка создания:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-dictionary-entry-page">
      <h1>Создание нового элемента справочника</h1>
      <DictionaryEntryForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="btn btn-secondary"
      >
        Отмена
      </button>
    </div>
  );
}
