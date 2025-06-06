import React, { useState } from 'react';
import { addFeedback } from '../../services/feedbackService';
import '../../styles/feedbacks/AddFeedbackModal.css';

const AddFeedbackModal = ({ event, onClose, onFeedbackAdded }) => {
  const [receiverId, setReceiverId] = useState('');
  const [satisfactionLevel, setSatisfactionLevel] = useState('neutral');
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const availablePlayers = event.players.filter(player => {
    return !event.feedbacks?.some(feedback => feedback.receiverId._id === (player.playerId ? player.playerId._id : player._id));
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const feedbackData = {
        eventId: event._id,
        receiverId,
        satisfactionLevel,
        comment,
      };
      await addFeedback(feedbackData);
      setSuccess('Feedback adăugat cu succes!');
      setReceiverId('');
      setSatisfactionLevel('neutral');
      setComment('');
      onFeedbackAdded();
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('feedback-modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="feedback-modal-overlay" onClick={handleOverlayClick}>
      <div className="feedback-modal-content">
        <h3>Add feedback</h3>
        {error && <p className="feedback-error">{error}</p>}
        {success && <p className="feedback-success">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="feedback-form-group">
            <label>Player:</label>
            <select
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              required
            >
              <option value="">Select a player</option>
              {availablePlayers.map(player => (
                <option key={player._id} value={player._id}>
                  {player.playerId ? `${player.playerId.firstName} ${player.playerId.lastName}` : player.name}
                </option>
              ))}
            </select>
          </div>
          <div className="feedback-form-group">
            <label>Satisfaction Level:</label>
            <select
              value={satisfactionLevel}
              onChange={(e) => setSatisfactionLevel(e.target.value)}
              required
            >
              <option value="good">Good</option>
              <option value="neutral">Neutral</option>
              <option value="bad">Bad</option>
            </select>
          </div>
          <div className="feedback-form-group">
            <label>Comment (opțional):</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="3"
              placeholder="Scrie un comentariu..."
            />
          </div>
          <div className="feedback-modal-actions">
            <button type="submit">Send feedback</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFeedbackModal;