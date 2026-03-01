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
      const response = await fetch('/api/v1/dict-entries/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Ошибка при создании элемента');
      }

      navigate('/dict-entry');
    } catch (error) {
      console.error('Ошибка создания:', error);
      // Здесь можно добавить отображение ошибки пользователю
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
