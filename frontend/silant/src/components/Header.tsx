import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/Header.css";
import { useAuth } from '../contexts/AuthContext';


const Header: React.FC = () => {
  const { userGroup, isAuthenticated } = useAuth();

  const showDictionaryButton = isAuthenticated && (userGroup === 'manager' || userGroup === 'superadmin');

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__logo">
          <a href="/" className="header__logo-link">
            <img
              src="/src/images/logo-red.jpg"
              alt="Логотип компании Силант"
              className="header__logo-image"
            />
            <h1 className="header__title">
              СИЛАНТ
            </h1>
          </a>
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
                to="/machine-list"
                className="header__button header__button--machines"
              >
                Машины
              </Link>

              {showDictionaryButton && (
                <Link
                  to="/dictionary"
                  className="header__button header__button--dictentry"
                >
                  Справочник
                </Link>
              )}

              <Link
                to="/maintenance"
                className="header__button header__button--maintenance"
              >
                ТО машин
              </Link>

              <Link
                to="/claims"
                className="header__button header__button--claims"
              >
                Рекламации
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
