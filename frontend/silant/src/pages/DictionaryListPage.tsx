import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../styles/DictionaryList.css";

interface DictionaryEntry {
  id: number;
  entity: string;
  entity_display: string;
  name: string;
  description: string | null;
}

export default function DictionaryListPage() {
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(
        'api/v1/dict-entries',
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
            }
        }
    )
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setEntries(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки справочника:', err);
        setError('Не удалось загрузить данные справочника');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading">Загрузка данных...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dictionary-list-page">
      <h1>Справочник элементов</h1>

      {entries.length === 0 ? (
        <div className="empty-state">
          <p>В справочнике пока нет элементов.</p>
        </div>
      ) : (
        <table className="dictionary-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Тип справочника</th>
              <th>Наименование</th>
              <th>Описание</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr key={entry.id}>
                <td>{entry.id}</td>
                <td>
                  <span
                    className={`entity-badge entity-${entry.entity}`}
                    data-entity={entry.entity}
                  >
                    {entry.entity_display}
                  </span>
                </td>
                <td>{entry.name}</td>
                <td className="description-cell">
                  {entry.description ? entry.description : <em>Нет описания</em>}
                </td>
                <td className="actions-cell">
                  <Link
                    to={`/dictionary/${entry.id}`}
                    className="btn btn-details"
                  >
                    Подробнее
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
