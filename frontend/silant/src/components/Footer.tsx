import React from 'react';
import '../styles/Footer.css';


const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__left">
          <a
            href="https://t.me/your-telegram-channel"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__link"
          >
            +7 (835) 220-12-09, Telegram
          </a>
        </div>
        <div className="footer__right">
          Мой Силант, 2026
        </div>
      </div>
    </footer>
  );
};

export default Footer;
