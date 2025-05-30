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
      onClose(); 
    }
  }, [countdown, onClose]);

  return (
    <div className="logout-modal-overlay">
      <div className="logout-modal">
        <h2>Your session has expired!</h2>
        <p>You will be disconnected in {countdown} seconds...</p>
      </div>
    </div>
  );
};

export default LogoutModal;