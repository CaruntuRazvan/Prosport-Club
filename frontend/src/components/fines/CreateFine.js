import React, { useState, useEffect } from 'react';
import { fetchPlayers } from '../../services/userService';
import { createFine } from '../../services/fineService';
import { toast } from 'react-toastify';
import '../../styles/fines/CreateFine.css';

const CreateFine = ({ userId, userRole, onClose, onFineCreated }) => {
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const playerList = await fetchPlayers();
        setPlayers(playerList);
        if (playerList.length > 0) {
          setReceiverId(playerList[0]._id);
        }
      } catch (err) {
        toast.error('Eroare la preluarea listei de jucători: ' + err.message, {
          autoClose: 1500,
          hideProgressBar: true,
          closeButton: false,
          style: {
            background: '#dc3545',
            color: '#fff',
            fontSize: '14px',
            padding: '8px 16px',
            borderRadius: '4px',
          },
        });
      }
    };
    loadPlayers();
  }, []);

  const validateDate = (dateStr) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(dateStr)) return false;

    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() + 1 === month && date.getFullYear() === year;
  };

  const convertToISO = (dateStr) => {
    if (!dateStr) return null;
    if (!validateDate(dateStr)) {
      throw new Error('Data de expirare trebuie să fie în format dd/mm/yyyy.');
    }

    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validare sumă
      const parsedAmount = parseFloat(amount);
      if (parsedAmount <= 0) {
        throw new Error('Suma trebuie să fie pozitivă.');
      }

      // Validare dată expirare
      let expirationDateISO = null;
      if (expirationDate) {
        expirationDateISO = convertToISO(expirationDate);
        if (new Date(expirationDateISO) <= new Date()) {
          throw new Error('Data de expirare trebuie să fie în viitor.');
        }
      }

      const newFine = {
        reason,
        amount: parsedAmount,
        receiverId,
        expirationDate: expirationDateISO,
        creatorId: userId,
        isActive: true,
      };

      await createFine(newFine);
      setReason('');
      setAmount('');
      setReceiverId(players.length > 0 ? players[0]._id : '');
      setExpirationDate('');

      if (onFineCreated) onFineCreated();
      onClose();

      toast.success('Penalizare creată!', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: {
          background: '#28a745',
          color: '#fff',
          fontSize: '14px',
          padding: '8px 16px',
          borderRadius: '4px',
        },
      });
    } catch (err) {
      toast.error('Eroare la crearea penalizării: ' + err.message, {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: {
          background: '#dc3545',
          color: '#fff',
          fontSize: '14px',
          padding: '8px 16px',
          borderRadius: '4px',
        },
      });
    }
  };

  return (
    <div className="create-fine-modal-overlay">
      <div className="create-fine-modal create-event-section">
        <h2>Crează Penalizare</h2>
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label>Motiv:</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Sumă (EUR):</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>Jucător:</label>
            <select
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              required
            >
              {players.map((player) => (
                <option key={player._id} value={player._id}>
                  {player.name} ({player.playerId?.position || 'N/A'})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Dată Expirare (dd/mm/yyyy):</label>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>
          <button type="submit" className="submit-event">
            Crează Penalizare
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateFine;