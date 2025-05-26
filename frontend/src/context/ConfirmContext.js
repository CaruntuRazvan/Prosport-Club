// src/context/ConfirmContext.js
import React, { createContext, useContext, useState } from 'react';
import Modal from 'react-modal';

// Setează elementul rădăcină pentru accesibilitate
Modal.setAppElement('#root');

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [onConfirm, setOnConfirm] = useState(null);

  const showConfirm = (msg, callback) => {
    setMessage(msg);
    setOnConfirm(() => callback);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setOnConfirm(null);
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      <Modal
        isOpen={isOpen}
        onRequestClose={handleCancel}
        className="confirm-modal"
        overlayClassName="confirm-overlay"
      >
        <h2>Confirmare</h2>
        <p>{message}</p>
        <div className="confirm-buttons">
          <button onClick={handleConfirm} className="confirm-btn">
            Confirmă
          </button>
          <button onClick={handleCancel} className="cancel-btn">
            Anulează
          </button>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => useContext(ConfirmContext);