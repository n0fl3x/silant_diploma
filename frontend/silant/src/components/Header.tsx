import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import "../styles/Header.css";
import { useAuth } from '../contexts/AuthContext';


const Header: React.FC = () => {
  const { isAuthenticated } = useAuth();

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
              <NavLink
                to="/machine-list"
                className={
                  ({ isActive }) => isActive ?
                    'header__button header__button--machines header__button--active' :
                    'header__button header__button--machines'
                }
              >
                Машины
              </NavLink>
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
