import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/Header.css";
import { useAuthContext } from '../contexts/AuthContext';


const Header: React.FC = () => {
  const { isAuthenticated } = useAuthContext();

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__logo">
          <Link to="/machine-search" className="header__logo-link">
            <h1 className="header__title">СИЛАНТ</h1>
          </Link>
        </div>

        <nav className="header__nav">
          <Link
            to="/machine-search"
            className="header__button header__button--main"
          >
            Главная
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="header__button header__button--dashboard"
              >
                Кабинет
              </Link>
              <Link
                to="/logout"
                className="header__button header__button--logout"
              >
                Выход
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="header__button header__button--login"
            >
              Вход
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
