import React, { useState } from 'react';
import { createPoll } from '../../services/pollService';
import { toast } from 'react-toastify';

const CreatePoll = ({ onPollCreated }) => {
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    expiresDate: '',
    expiresTime: '',
  });

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    try {
      // Validare întrebare
      if (!newPoll.question.trim()) {
        throw new Error('The question is required and cannot be empty.');
      }
      if (newPoll.question.length > 200) {
        throw new Error('The question cannot exceed 200 characters.');
      }

      // Validare opțiuni
      const validOptions = newPoll.options.filter(opt => opt.trim() !== '');
      if (validOptions.length < 2) {
        throw new Error('There must be at least 2 valid options.');
      }
      if (validOptions.length > 10) {
        throw new Error('You cannot have more than 10 options.');
      }
      const uniqueOptions = new Set(validOptions.map(opt => opt.toLowerCase()));
      if (uniqueOptions.size !== validOptions.length) {
        throw new Error('Options cannot be duplicates.');
      }
      validOptions.forEach((opt, index) => {
        if (opt.length > 100) {
          throw new Error(`Option ${index + 1} cannot exceed 100 characters.`);
        }
      });

      let expiresAt = undefined;
      if (newPoll.expiresDate || newPoll.expiresTime) {
        if (!newPoll.expiresDate || !newPoll.expiresTime) {
          throw new Error('You must provide both the expiration date and time.');
        }

        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(newPoll.expiresDate)) {
          throw new Error('The date must be in dd/mm/yyyy format (e.g., 31/03/2025).');
        }

        if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(newPoll.expiresTime)) {
          throw new Error('The time must be in hh:mm format (e.g., 09:00 or 21:00).');
        }

        const [day, month, year] = newPoll.expiresDate.split('/');
        const [hours, minutes] = newPoll.expiresTime.split(':');
        const parsedDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);

        if (isNaN(parsedDate.getTime())) {
          throw new Error('The entered date or time are invalid.');
        }

        const now = new Date();
        if (parsedDate <= now) {
          throw new Error('The expiration date must be in the future.');
        }

        expiresAt = parsedDate.toISOString();
      }

      const pollData = {
        question: newPoll.question,
        options: validOptions,
        expiresAt,
      };
      await createPoll(pollData);
      setNewPoll({ question: '', options: ['', ''], expiresDate: '', expiresTime: '' });

      if (onPollCreated) onPollCreated();
      toast.success('Poll created successfully!', {
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
    } catch (error) {
      toast.error(error.message || 'Error creating the poll.', {
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

  const handleAddOption = () => {
    setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll({ ...newPoll, options: updatedOptions });
  };

  return (
    <div className="create-poll">
      <h3>Create a New Poll</h3>
      <form onSubmit={handleCreatePoll} className="poll-form">
        <div className="form-group">
          <label>Question:</label>
          <input
            type="text"
            value={newPoll.question}
            onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Options:</label>
          {newPoll.options.map((option, index) => (
            <input
              key={index}
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              required
            />
          ))}
          <button type="button" onClick={handleAddOption} className="add-option-btn">
            Add option
          </button>
        </div>
        <div className="form-group">
          <label>Expiration Date:</label>
          <input
            type="text"
            placeholder="dd/mm/yyyy"
            value={newPoll.expiresDate}
            onChange={(e) => setNewPoll({ ...newPoll, expiresDate: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Expiration Time:</label>
          <input
            type="text"
            placeholder="hh:mm"
            value={newPoll.expiresTime}
            onChange={(e) => setNewPoll({ ...newPoll, expiresTime: e.target.value })}
          />
        </div>
        <button type="submit" className="submit-btn">
          Create Poll
        </button>
      </form>
    </div>
  );
};

export default CreatePoll;