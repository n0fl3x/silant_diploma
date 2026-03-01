import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/DictionaryLink.css";

interface DictionaryLinkProps {
  id: number | null | undefined;
  name: string | null | undefined;
  className?: string;
}

export const DictionaryLink: React.FC<DictionaryLinkProps> = ({ id, name, className = '' }) => {
  if (!id || !name) {
    return <span className={`dictionary-link-placeholder ${className}`}>—</span>;
  }

  return (
    <Link
      to={`/dictionary/${id}`}
      className={`dictionary-link ${className}`}
      style={{
        color: '#0066cc',
        textDecoration: 'none',
        fontWeight: '500',
        transition: 'color 0.2s ease'
      }}
    >
      {name}
    </Link>
  );
};
