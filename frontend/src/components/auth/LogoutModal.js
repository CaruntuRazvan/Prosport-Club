import React, { useState, useEffect } from 'react';
import '../../styles/auth/LogoutModal.css';

const LogoutModal = ({ onClose }) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      onClose(); // Apelăm onClose doar după ce countdown ajunge la 0
    }
  }, [countdown, onClose]);

  return (
    <div className="logout-modal-overlay">
      <div className="logout-modal">
        <h2>Sesiunea ta a expirat!</h2>
        <p>Vei fi deconectat în {countdown} secunde...</p>
      </div>
    </div>
  );
};

export default LogoutModal;