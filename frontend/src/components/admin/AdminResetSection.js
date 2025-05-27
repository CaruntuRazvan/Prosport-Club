import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchUsers } from '../../services/userService';
import { resetAllFines, resetUserFines } from '../../services/fineService';
import { resetAllPolls, resetUserPolls } from '../../services/pollService';
import { resetAllFeedbacks, resetUserFeedbacks, resetAllFeedbackSummaries, resetUserFeedbackSummaries } from '../../services/feedbackService';
import { resetAllEvents, resetUserEvents } from '../../services/eventService'; // Importăm noile funcții
import { useConfirm } from '../../context/ConfirmContext';
import '../../styles/admin/AdminResetSection.css';

// Funcție reutilizabilă pentru toast-uri
const showToast = (message, type = 'success') => {
  const toastConfig = {
    autoClose: 1500,
    hideProgressBar: true,
    closeButton: false,
    style: {
      background: type === 'success' ? '#28a745' : '#dc3545',
      color: '#fff',
      fontSize: '14px',
      padding: '8px 16px',
      borderRadius: '4px',
    },
  };
  if (type === 'success') {
    toast.success(message, toastConfig);
  } else {
    toast.error(message, toastConfig);
  }
};

const AdminResetSection = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showConfirm } = useConfirm();

  // Încarcă lista utilizatorilor
  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        showToast('Eroare la preluarea utilizatorilor: ' + error.message, 'error');
      }
    };
    fetchUsersData();
  }, []);

  // Șterge toate amenzile
  const handleResetAllFines = async () => {
    showConfirm('Ești sigur că vrei să ștergi toate amenzile din baza de date? Această acțiune este ireversibilă!', async () => {
      setIsLoading(true);
      try {
        await resetAllFines();
        showToast('Toate amenzile au fost șterse cu succes!');
      } catch (error) {
        showToast('Eroare la ștergerea amenzilor: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Șterge amenzile unui utilizator selectat
  const handleResetUserFines = async () => {
    if (!selectedUserId) {
      showToast('Selectează un utilizator pentru resetare!', 'error');
      return;
    }

    showConfirm('Ești sigur că vrei să ștergi toate amenzile asociate acestui utilizator? Această acțiune este ireversibilă!', async () => {
      setIsLoading(true);
      try {
        await resetUserFines(selectedUserId);
        showToast('Amenzile utilizatorului au fost șterse cu succes!');
        setSelectedUserId('');
      } catch (error) {
        showToast('Eroare la ștergerea amenzilor utilizatorului: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Șterge toate sondajele
  const handleResetAllPolls = async () => {
    showConfirm('Ești sigur că vrei să ștergi toate sondajele din baza de date? Această acțiune este ireversibilă!', async () => {
      setIsLoading(true);
      try {
        await resetAllPolls();
        showToast('Toate sondajele au fost șterse cu succes!');
      } catch (error) {
        showToast('Eroare la ștergerea sondajelor: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Șterge sondajele și voturile unui utilizator selectat
  const handleResetUserPolls = async () => {
    if (!selectedUserId) {
      showToast('Selectează un utilizator pentru resetare!', 'error');
      return;
    }

    showConfirm('Ești sigur că vrei să ștergi toate sondajele create de acest utilizator și voturile sale? Această acțiune este ireversibilă!', async () => {
      setIsLoading(true);
      try {
        await resetUserPolls(selectedUserId);
        showToast('Sondajele și voturile utilizatorului au fost șterse cu succes!');
        setSelectedUserId('');
      } catch (error) {
        showToast('Eroare la ștergerea sondajelor utilizatorului: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Șterge toate feedback-urile
  const handleResetAllFeedbacks = async () => {
    showConfirm('Ești sigur că vrei să ștergi toate feedback-urile din baza de date? Această acțiune este ireversibilă!', async () => {
      setIsLoading(true);
      try {
        await resetAllFeedbacks();
        showToast('Toate feedback-urile au fost șterse cu succes!');
      } catch (error) {
        showToast('Eroare la ștergerea feedback-urilor: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Șterge feedback-urile asociate unui utilizator selectat
  const handleResetUserFeedbacks = async () => {
    if (!selectedUserId) {
      showToast('Selectează un utilizator pentru resetare!', 'error');
      return;
    }

    showConfirm('Ești sigur că vrei să ștergi toate feedback-urile asociate acestui utilizator? Această acțiune este ireversibilă!', async () => {
      setIsLoading(true);
      try {
        await resetUserFeedbacks(selectedUserId);
        showToast('Feedback-urile utilizatorului au fost șterse cu succes!');
        setSelectedUserId('');
      } catch (error) {
        showToast('Eroare la ștergerea feedback-urilor utilizatorului: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Șterge toate rezumatele feedback-urilor
  const handleResetAllFeedbackSummaries = async () => {
    showConfirm('Ești sigur că vrei să ștergi toate rezumatele feedback-urilor din baza de date? Această acțiune este ireversibilă!', async () => {
      setIsLoading(true);
      try {
        await resetAllFeedbackSummaries();
        showToast('Toate rezumatele feedback-urilor au fost șterse cu succes!');
      } catch (error) {
        showToast('Eroare la ștergerea rezumatelor feedback-urilor: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Șterge rezumatele feedback-urilor asociate unui utilizator selectat
  const handleResetUserFeedbackSummaries = async () => {
    if (!selectedUserId) {
      showToast('Selectează un utilizator pentru resetare!', 'error');
      return;
    }

    showConfirm('Ești sigur că vrei să ștergi toate rezumatele feedback-urilor asociate acestui utilizator? Această acțiune este ireversibilă!', async () => {
      setIsLoading(true);
      try {
        await resetUserFeedbackSummaries(selectedUserId);
        showToast('Rezumatele feedback-urilor utilizatorului au fost șterse cu succes!');
        setSelectedUserId('');
      } catch (error) {
        showToast('Eroare la ștergerea rezumatelor feedback-urilor utilizatorului: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Șterge toate evenimentele
  const handleResetAllEvents = async () => {
    showConfirm('Ești sigur că vrei să ștergi toate evenimentele din baza de date? Această acțiune este ireversibilă!', async () => {
      setIsLoading(true);
      try {
        await resetAllEvents();
        showToast('Toate evenimentele și notificările asociate au fost șterse cu succes!');
      } catch (error) {
        showToast('Eroare la ștergerea evenimentelor: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Șterge evenimentele asociate unui utilizator selectat
  const handleResetUserEvents = async () => {
    if (!selectedUserId) {
      showToast('Selectează un utilizator pentru resetare!', 'error');
      return;
    }

    showConfirm('Ești sigur că vrei să ștergi toate evenimentele asociate acestui utilizator? Această acțiune este ireversibilă!', async () => {
      setIsLoading(true);
      try {
        await resetUserEvents(selectedUserId);
        showToast('Evenimentele și notificările utilizatorului au fost șterse cu succes!');
        setSelectedUserId('');
      } catch (error) {
        showToast('Eroare la ștergerea evenimentelor utilizatorului: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <section className="admin-reset-section">
      <h3 className="reset-section-title">Resetare Date</h3>
      <div className="reset-container">
        {/* Coloana stângă: Reset total */}
        <div className="reset-column reset-all-column">
          <h4>Resetare Totală</h4>
          <div className="reset-item">
            <p>Șterge toate evenimentele</p>
            <button
              className="reset-btn"
              onClick={handleResetAllEvents}
              disabled={isLoading}
            >
              {isLoading ? 'Se procesează...' : 'Șterge Evenimentele'}
            </button>
          </div>
          <div className="reset-item">
            <p>Șterge toate amenzile</p>
            <button
              className="reset-btn"
              onClick={handleResetAllFines}
              disabled={isLoading}
            >
              {isLoading ? 'Se procesează...' : 'Șterge Amenzile'}
            </button>
          </div>
          <div className="reset-item">
            <p>Șterge toate sondajele</p>
            <button
              className="reset-btn"
              onClick={handleResetAllPolls}
              disabled={isLoading}
            >
              {isLoading ? 'Se procesează...' : 'Șterge Sondajele'}
            </button>
          </div>
          <div className="reset-item">
            <p>Șterge toate feedback-urile</p>
            <button
              className="reset-btn"
              onClick={handleResetAllFeedbacks}
              disabled={isLoading}
            >
              {isLoading ? 'Se procesează...' : 'Șterge Feedback-urile'}
            </button>
          </div>
          <div className="reset-item">
            <p>Șterge toate rezumatele feedback-urilor</p>
            <button
              className="reset-btn"
              onClick={handleResetAllFeedbackSummaries}
              disabled={isLoading}
            >
              {isLoading ? 'Se procesează...' : 'Șterge Rezumatele'}
            </button>
          </div>
        </div>

        {/* Coloana dreaptă: Reset per utilizator */}
        <div className="reset-column reset-user-column">
          <h4>Resetare per Utilizator</h4>
          <div className="reset-item">
            <p>Evenimentele utilizatorului</p>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
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
              onClick={handleResetUserEvents}
              disabled={!selectedUserId || isLoading}
            >
              {isLoading ? 'Se procesează...' : 'Șterge Evenimentele'}
            </button>
          </div>
          <div className="reset-item">
            <p>Amenzile utilizatorului</p>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
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
              disabled={!selectedUserId || isLoading}
            >
              {isLoading ? 'Se procesează...' : 'Șterge Amenzile'}
            </button>
          </div>
          <div className="reset-item">
            <p>Sondajele utilizatorului</p>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
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
              disabled={!selectedUserId || isLoading}
            >
              {isLoading ? 'Se procesează...' : 'Șterge Sondajele'}
            </button>
          </div>
          <div className="reset-item">
            <p>Feedback-urile utilizatorului</p>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
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
              disabled={!selectedUserId || isLoading}
            >
              {isLoading ? 'Se procesează...' : 'Șterge Feedback-urile'}
            </button>
          </div>
          <div className="reset-item">
            <p>Rezumatele feedback-urilor utilizatorului</p>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
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
              disabled={!selectedUserId || isLoading}
            >
              {isLoading ? 'Se procesează...' : 'Șterge Rezumatele'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminResetSection;