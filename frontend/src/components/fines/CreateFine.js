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
        toast.error('Error fetching the list of players: ' + err.message, {
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
      throw new Error('The expiration date must be in dd/mm/yyyy format.');
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
        throw new Error('The amount must be positive.');
      }

      // Validare dată expirare
      let expirationDateISO = null;
      if (expirationDate) {
        expirationDateISO = convertToISO(expirationDate);
        if (new Date(expirationDateISO) <= new Date()) {
          throw new Error('The expiration date must be in the future.');
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

      toast.success('Fine created!', {
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
      toast.error('Error creating the fine: ' + err.message, {
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
        <h2>Create Fine</h2>
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label>Reason:</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Amount (EUR):</label>
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
            <label>Player:</label>
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
            <label>Expiration Date (dd/mm/yyyy):</label>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>
          <button type="submit" className="submit-event">
            Create Fine
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateFine;