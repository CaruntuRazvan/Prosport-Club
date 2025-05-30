import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchUsers } from '../../services/userService';
import { resetAllFines, resetUserFines } from '../../services/fineService';
import { resetAllPolls, resetUserPolls } from '../../services/pollService';
import { resetAllFeedbacks, resetUserFeedbacks, resetAllFeedbackSummaries, resetUserFeedbackSummaries } from '../../services/feedbackService';
import { resetAllEvents, resetUserEvents } from '../../services/eventService';
import { useConfirm } from '../../context/ConfirmContext';
import '../../styles/admin/AdminResetSection.css';

// Reusable function for toasts
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
  const  showConfirm  = useConfirm();

  // Load user list
  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        showToast('Error fetching users: ' + error.message, 'error');
      }
    };
    fetchUsersData();
  }, []);

  // Reset all fines
  const handleResetAllFines = async () => {
    showConfirm('Are you sure you want to delete all fines from the database? This action is irreversible!', async () => {
      setIsLoading(true);
      try {
        await resetAllFines();
        showToast('All fines have been successfully deleted!');
      } catch (error) {
        showToast('Error deleting fines: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Reset fines for a selected user
  const handleResetUserFines = async () => {
    if (!selectedUserId) {
      showToast('Select a user to reset!', 'error');
      return;
    }

    showConfirm('Are you sure you want to delete all fines associated with this user? This action is irreversible!', async () => {
      setIsLoading(true);
      try {
        await resetUserFines(selectedUserId);
        showToast('User fines have been successfully deleted!');
        setSelectedUserId('');
      } catch (error) {
        showToast('Error deleting user fines: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Reset all polls
  const handleResetAllPolls = async () => {
    showConfirm('Are you sure you want to delete all polls from the database? This action is irreversible!', async () => {
      setIsLoading(true);
      try {
        await resetAllPolls();
        showToast('All polls have been successfully deleted!');
      } catch (error) {
        showToast('Error deleting polls: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Reset polls and votes for a selected user
  const handleResetUserPolls = async () => {
    if (!selectedUserId) {
      showToast('Select a user to reset!', 'error');
      return;
    }

    showConfirm('Are you sure you want to delete all polls created by this user and their votes? This action is irreversible!', async () => {
      setIsLoading(true);
      try {
        await resetUserPolls(selectedUserId);
        showToast('User polls and votes have been successfully deleted!');
        setSelectedUserId('');
      } catch (error) {
        showToast('Error deleting user polls: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Reset all feedbacks
  const handleResetAllFeedbacks = async () => {
    showConfirm('Are you sure you want to delete all feedbacks from the database? This action is irreversible!', async () => {
      setIsLoading(true);
      try {
        await resetAllFeedbacks();
        showToast('All feedbacks have been successfully deleted!');
      } catch (error) {
        showToast('Error deleting feedbacks: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Reset feedbacks for a selected user
  const handleResetUserFeedbacks = async () => {
    if (!selectedUserId) {
      showToast('Select a user to reset!', 'error');
      return;
    }

    showConfirm('Are you sure you want to delete all feedbacks associated with this user? This action is irreversible!', async () => {
      setIsLoading(true);
      try {
        await resetUserFeedbacks(selectedUserId);
        showToast('User feedbacks have been successfully deleted!');
        setSelectedUserId('');
      } catch (error) {
        showToast('Error deleting user feedbacks: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Reset all feedback summaries
  const handleResetAllFeedbackSummaries = async () => {
    showConfirm('Are you sure you want to delete all feedback summaries from the database? This action is irreversible!', async () => {
      setIsLoading(true);
      try {
        await resetAllFeedbackSummaries();
        showToast('All feedback summaries have been successfully deleted!');
      } catch (error) {
        showToast('Error deleting feedback summaries: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Reset feedback summaries for a selected user
  const handleResetUserFeedbackSummaries = async () => {
    if (!selectedUserId) {
      showToast('Select a user to reset!', 'error');
      return;
    }

    showConfirm('Are you sure you want to delete all feedback summaries associated with this user? This action is irreversible!', async () => {
      setIsLoading(true);
      try {
        await resetUserFeedbackSummaries(selectedUserId);
        showToast('User feedback summaries have been successfully deleted!');
        setSelectedUserId('');
      } catch (error) {
        showToast('Error deleting user feedback summaries: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Reset all events
  const handleResetAllEvents = async () => {
    showConfirm('Are you sure you want to delete all events from the database? This action is irreversible!', async () => {
      setIsLoading(true);
      try {
        await resetAllEvents();
        showToast('All events and associated notifications have been successfully deleted!');
      } catch (error) {
        showToast('Error deleting events: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Reset events for a selected user
  const handleResetUserEvents = async () => {
    if (!selectedUserId) {
      showToast('Select a user to reset!', 'error');
      return;
    }

    showConfirm('Are you sure you want to delete all events associated with this user? This action is irreversible!', async () => {
      setIsLoading(true);
      try {
        await resetUserEvents(selectedUserId);
        showToast('User events and notifications have been successfully deleted!');
        setSelectedUserId('');
      } catch (error) {
        showToast('Error deleting user events: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <section className="admin-reset-section">
      <h3 className="reset-section-title">Data Reset</h3>
      <div className="reset-container">
        {/* Left column: Total reset */}
        <div className="reset-column reset-all-column">
          <h4>Total Reset</h4>
          <div className="reset-item">
            <p>Delete all events</p>
            <button
              className="reset-btn"
              onClick={handleResetAllEvents}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Delete Events'}
            </button>
          </div>
          <div className="reset-item">
            <p>Delete all fines</p>
            <button
              className="reset-btn"
              onClick={handleResetAllFines}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Delete Fines'}
            </button>
          </div>
          <div className="reset-item">
            <p>Delete all polls</p>
            <button
              className="reset-btn"
              onClick={handleResetAllPolls}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Delete Polls'}
            </button>
          </div>
          <div className="reset-item">
            <p>Delete all feedbacks</p>
            <button
              className="reset-btn"
              onClick={handleResetAllFeedbacks}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Delete Feedbacks'}
            </button>
          </div>
          <div className="reset-item">
            <p>Delete all feedback summaries</p>
            <button
              className="reset-btn"
              onClick={handleResetAllFeedbackSummaries}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Delete Summaries'}
            </button>
          </div>
        </div>

        {/* Right column: Reset per user */}
        <div className="reset-column reset-user-column">
          <h4>Reset per User</h4>
          <div className="reset-item">
            <p>User events</p>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="reset-user-dropdown"
            >
              <option value="">Select a user</option>
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
              {isLoading ? 'Processing...' : 'Delete Events'}
            </button>
          </div>
          <div className="reset-item">
            <p>User fines</p>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="reset-user-dropdown"
            >
              <option value="">Select a user</option>
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
              {isLoading ? 'Processing...' : 'Delete Fines'}
            </button>
          </div>
          <div className="reset-item">
            <p>User polls</p>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="reset-user-dropdown"
            >
              <option value="">Select a user</option>
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
              {isLoading ? 'Processing...' : 'Delete Polls'}
            </button>
          </div>
          <div className="reset-item">
            <p>User feedbacks</p>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="reset-user-dropdown"
            >
              <option value="">Select a user</option>
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
              {isLoading ? 'Processing...' : 'Delete Feedbacks'}
            </button>
          </div>
          <div className="reset-item">
            <p>User feedback summaries</p>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="reset-user-dropdown"
            >
              <option value="">Select a user</option>
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
              {isLoading ? 'Processing...' : 'Delete Summaries'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminResetSection;