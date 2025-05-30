// src/components/Footer.js
import React from 'react';
import '../../styles/shared/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <img src="/images/logo.png" alt="Club Logo" className="footer-logo" />
        <p className="footer-copyright">© 2025 ProSport Club</p>
        <div className="footer-links">
          <a
            href="mailto:support-it@prosportclub.ro?subject=Suport%20Tehnic%20-%20Aplicație%20Club"
            className="footer-contact-link"
          >
            Contact IT
          </a>
          <a
            href="/documents/prosport_regulations.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-regulations-link"
          >
            Club Regulations
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;