import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchUsers } from '../../services/userService';
import { resetAllFines, resetUserFines } from '../../services/fineService';
import { resetAllPolls, resetUserPolls } from '../../services/pollService';
import { resetAllFeedbacks, resetUserFeedbacks, resetAllFeedbackSummaries, resetUserFeedbackSummaries } from '../../services/feedbackService';
import '../../styles/admin/AdminResetSection.css';

const AdminResetSection = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserIdFines, setSelectedUserIdFines] = useState('');
  const [selectedUserIdPolls, setSelectedUserIdPolls] = useState('');
  const [selectedUserIdFeedbacks, setSelectedUserIdFeedbacks] = useState('');
  const [selectedUserIdFeedbackSummaries, setSelectedUserIdFeedbackSummaries] = useState('');

  // Încarcă lista utilizatorilor
  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        toast.error('Eroare la preluarea utilizatorilor: ' + error.message, {
          autoClose: 1500,
          hideProgressBar: true,
          closeButton: false,
          style: { background: '#dc3545', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
        });
      }
    };
    fetchUsersData();
  }, []);

  // Șterge toate amenzile
  const handleResetAllFines = async () => {
    const confirmReset = window.confirm('Ești sigur că vrei să ștergi toate amenzile din baza de date? Această acțiune este ireversibilă!');
    if (!confirmReset) return;

    try {
      await resetAllFines();
      toast.success('Toate amenzile au fost șterse cu succes!', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: { background: '#28a745', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
      });
    } catch (error) {
      toast.error('Eroare la ștergerea amenzilor: ' + error.message, {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: { background: '#dc3545', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
      });
    }
  };

  // Șterge amenzile unui utilizator selectat
  const handleResetUserFines = async () => {
    if (!selectedUserIdFines) {
      toast.error('Selectează un utilizator pentru resetare!', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: { background: '#dc3545', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
      });
      return;
    }

    const confirmReset = window.confirm('Ești sigur că vrei să ștergi toate amenzile asociate acestui utilizator? Această acțiune este ireversibilă!');
    if (!confirmReset) return;

    try {
      await resetUserFines(selectedUserIdFines);
      toast.success('Amenzile utilizatorului au fost șterse cu succes!', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: { background: '#28a745', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
      });
      setSelectedUserIdFines('');
    } catch (error) {
      toast.error('Eroare la ștergerea amenzilor utilizatorului: ' + error.message, {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: { background: '#dc3545', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
      });
    }
  };

  // Șterge toate sondajele
  const handleResetAllPolls = async () => {
    const confirmReset = window.confirm('Ești sigur că vrei să ștergi toate sondajele din baza de date? Această acțiune este ireversibilă!');
    if (!confirmReset) return;

    try {
      await resetAllPolls();
      toast.success('Toate sondajele au fost șterse cu succes!', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: { background: '#28a745', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
      });
    } catch (error) {
      toast.error('Eroare la ștergerea sondajelor: ' + error.message, {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: { background: '#dc3545', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
      });
    }
  };

  // Șterge sondajele și voturile unui utilizator selectat
  const handleResetUserPolls = async () => {
    if (!selectedUserIdPolls) {
      toast.error('Selectează un utilizator pentru resetare!', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: { background: '#dc3545', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
      });
      return;
    }

    const confirmReset = window.confirm('Ești sigur că vrei să ștergi toate sondajele create de acest utilizator și voturile sale? Această acțiune este ireversibilă!');
    if (!confirmReset) return;

    try {
      await resetUserPolls(selectedUserIdPolls);
      toast.success('Sondajele și voturile utilizatorului au fost șterse cu succes!', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: { background: '#28a745', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
      });
      setSelectedUserIdPolls('');
    } catch (error) {
      toast.error('Eroare la ștergerea sondajelor utilizatorului: ' + error.message, {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: { background: '#dc3545', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
      });
    }
  };

  // Șterge toate feedback-urile
  const handleResetAllFeedbacks = async () => {
    const confirmReset = window.confirm('Ești sigur că vrei să ștergi toate feedback-urile din baza de date? Această acțiune este ireversibilă!');
    if (!confirmReset) return;

    try {
      await resetAllFeedbacks();
      toast.success('Toate feedback-urile au fost șterse cu succes!', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: { background: '#28a745', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
      });
    } catch (error) {
      toast.error('Eroare la ștergerea feedback-urilor: ' + error.message, {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: { background: '#dc3545', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
      });
    }
  };

  // Șterge feedback-urile asociate unui utilizator selectat
  const handleResetUserFeedbacks = async () => {
    if (!selectedUserIdFeedbacks) {
      toast.error('Selectează un utilizator pentru resetare!', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: { background: '#dc3545', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
      });
      return;
    }

    const confirmReset = window.confirm('Ești sigur că vrei să ștergi toate feedback-urile asociate acestui utilizator? Această acțiune este ireversibilă!');
    if (!confirmReset) return;

    try {
      await resetUserFeedbacks(selectedUserIdFeedbacks);
      toast.success('Feedback-urile utilizatorului au fost șterse cu succes!', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: { background: '#28a745', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
      });
      setSelectedUserIdFeedbacks('');
    } catch (error) {
      toast.error('Eroare la ștergerea feedback-urilor utilizatorului: ' + error.message, {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: { background: '#dc3545', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
      });
    }
  };

  // Șterge toate rezumatele feedback-urilor
  const handleResetAllFeedbackSummaries = async () => {
    const confirmReset = window.confirm('Ești sigur că vrei să ștergi toate rezumatele feedback-urilor din baza de date? Această acțiune este ireversibilă!');
    if (!confirmReset) return;

    try {
      await resetAllFeedbackSummaries();
      toast.success('Toate rezumatele feedback-urilor au fost șterse cu succes!', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: { background: '#28a745', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
      });
    } catch (error) {
      toast.error('Eroare la ștergerea rezumatelor feedback-urilor: ' + error.message, {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: { background: '#dc3545', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
      });
    }
  };

  // Șterge rezumatele feedback-urilor asociate unui utilizator selectat
  const handleResetUserFeedbackSummaries = async () => {
    if (!selectedUserIdFeedbackSummaries) {
      toast.error('Selectează un utilizator pentru resetare!', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: { background: '#dc3545', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
      });
      return;
    }

    const confirmReset = window.confirm('Ești sigur că vrei să ștergi toate rezumatele feedback-urilor asociate acestui utilizator? Această acțiune este ireversibilă!');
    if (!confirmReset) return;

    try {
      await resetUserFeedbackSummaries(selectedUserIdFeedbackSummaries);
      toast.success('Rezumatele feedback-urilor utilizatorului au fost șterse cu succes!', {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: { background: '#28a745', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
      });
      setSelectedUserIdFeedbackSummaries('');
    } catch (error) {
      toast.error('Eroare la ștergerea rezumatelor feedback-urilor utilizatorului: ' + error.message, {
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        style: { background: '#dc3545', color: '#fff', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' },
      });
    }
  };

  return (
    <section className="admin-reset-section">
      <h3 className="reset-section-title">Resetare Date</h3>
      <div className="reset-container">
        {/* Coloana stângă: Reset total */}
        <div className="reset-column reset-all-column">
          <h4>Resetare Totală</h4>
          <div className="reset-item">
            <p>Șterge toate amenzile</p>
            <button className="reset-btn" onClick={handleResetAllFines}>
              Șterge Amenzile
            </button>
          </div>
          <div className="reset-item">
            <p>Șterge toate sondajele</p>
            <button className="reset-btn" onClick={handleResetAllPolls}>
              Șterge Sondajele
            </button>
          </div>
          <div className="reset-item">
            <p>Șterge toate feedback-urile</p>
            <button className="reset-btn" onClick={handleResetAllFeedbacks}>
              Șterge Feedback-urile
            </button>
          </div>
          <div className="reset-item">
            <p>Șterge toate rezumatele feedback-urilor</p>
            <button className="reset-btn" onClick={handleResetAllFeedbackSummaries}>
              Șterge Rezumatele
            </button>
          </div>
        </div>

        {/* Coloana dreaptă: Reset per utilizator */}
        <div className="reset-column reset-user-column">
          <h4>Resetare per Utilizator</h4>
          <div className="reset-item">
            <p>Amenzile utilizatorului</p>
            <select
              value={selectedUserIdFines}
              onChange={(e) => setSelectedUserIdFines(e.target.value)}
              className="reset-user-dropdown"
            >
              <option value="">Selectează un utilizator</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            <button
              className="reset-btn"
              onClick={handleResetUserFines}
              disabled={!selectedUserIdFines}
            >
              Șterge Amenzile
            </button>
          </div>
          <div className="reset-item">
            <p>Sondajele utilizatorului</p>
            <select
              value={selectedUserIdPolls}
              onChange={(e) => setSelectedUserIdPolls(e.target.value)}
              className="reset-user-dropdown"
            >
              <option value="">Selectează un utilizator</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            <button
              className="reset-btn"
              onClick={handleResetUserPolls}
              disabled={!selectedUserIdPolls}
            >
              Șterge Sondajele
            </button>
          </div>
          <div className="reset-item">
            <p>Feedback-urile utilizatorului</p>
            <select
              value={selectedUserIdFeedbacks}
              onChange={(e) => setSelectedUserIdFeedbacks(e.target.value)}
              className="reset-user-dropdown"
            >
              <option value="">Selectează un utilizator</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            <button
              className="reset-btn"
              onClick={handleResetUserFeedbacks}
              disabled={!selectedUserIdFeedbacks}
            >
              Șterge Feedback-urile
            </button>
          </div>
          <div className="reset-item">
            <p>Rezumatele feedback-urilor utilizatorului</p>
            <select
              value={selectedUserIdFeedbackSummaries}
              onChange={(e) => setSelectedUserIdFeedbackSummaries(e.target.value)}
              className="reset-user-dropdown"
            >
              <option value="">Selectează un utilizator</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            <button
              className="reset-btn"
              onClick={handleResetUserFeedbackSummaries}
              disabled={!selectedUserIdFeedbackSummaries}
            >
              Șterge Rezumatele
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminResetSection;