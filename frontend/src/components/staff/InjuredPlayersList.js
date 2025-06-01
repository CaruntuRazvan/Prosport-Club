import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchInjuries, createInjury, updateInjury } from '../../services/injuryService';
import { fetchPlayers } from '../../services/userService';
import '../../styles/staff/InjuredPlayersList.css';

const InjuredPlayersList = ({ userRole }) => {
  const [injuries, setInjuries] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInjury, setSelectedInjury] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editData, setEditData] = useState({
    playerId: '',
    type: '',
    injuryDate: '',
    estimatedDuration: '',
    status: 'injured',
    recoveryProgress: 0,
    activityRestrictions: '',
    notes: '',
  });

  useEffect(() => {
    console.log('User Role:', userRole); // Depanare
    const loadData = async () => {
      try {
        setLoading(true);
        const [injuryData, playerData] = await Promise.all([fetchInjuries(), fetchPlayers()]);
        console.log('Injuries Loaded:', injuryData); // Depanare
        console.log('Players Loaded:', playerData); // Depanare
        setInjuries(injuryData);
        setPlayers(playerData);
      } catch (error) {
        toast.error('Error loading data', {
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
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (selectedInjury || isCreating) {
      document.body.style.overflow = 'hidden'; 
      const handleEsc = (e) => {
        if (e.key === 'Escape') {
          setSelectedInjury(null);
          setIsEditing(false);
          setIsCreating(false);
          setEditData({
            playerId: '',
            type: '',
            injuryDate: '',
            estimatedDuration: '',
            status: 'injured',
            recoveryProgress: 0,
            activityRestrictions: '',
            notes: '',
          });
        }
      };
      document.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = 'auto'; 
        document.removeEventListener('keydown', handleEsc);
      };
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [selectedInjury, isCreating]);


  const validateDate = (dateStr) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(dateStr)) return false;

    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() + 1 === month && date.getFullYear() === year;
  };

  // Funcție pentru conversia datei din format dd/mm/yyyy în ISO
  const convertToISO = (dateStr) => {
    if (!dateStr) return null;
    if (!validateDate(dateStr)) {
      throw new Error('The date must be in dd/mm/yyyy format.');
    }

    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toISOString();
  };

  // Funcție pentru conversia datei din format ISO în dd/mm/yyyy
  const convertToDDMMYYYY = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validare dată
      let injuryDateISO = null;
      if (editData.injuryDate) {
        injuryDateISO = convertToISO(editData.injuryDate);
        if (new Date(injuryDateISO) > new Date()) {
          throw new Error('The injury date cannot be in the future.');
        }
      }

      const injuryData = {
        playerId: editData.playerId,
        type: editData.type,
        injuryDate: injuryDateISO,
        estimatedDuration: parseInt(editData.estimatedDuration),
        activityRestrictions: editData.activityRestrictions,
        notes: editData.notes,
      };
      console.log('Creating Injury Data:', injuryData); // Depanare

      const newInjury = await createInjury(injuryData);
      console.log('New Injury Response:', newInjury); // Depanare
      setInjuries([...injuries, newInjury]);
      setIsCreating(false); // Închide modalul
      setEditData({
        playerId: '',
        type: '',
        injuryDate: '',
        estimatedDuration: '',
        status: 'injured',
        recoveryProgress: 0,
        activityRestrictions: '',
        notes: '',
      });
      toast.success('Injury created successfully!', {
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
      
      toast.error(error.message || 'Error creating the injury.', {
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validare dată
      let injuryDateISO = null;
      if (editData.injuryDate) {
        injuryDateISO = convertToISO(editData.injuryDate);
        if (new Date(injuryDateISO) > new Date()) {
          throw new Error('The injury date cannot be in the future.');
        }
      }

      const injuryData = {
        type: editData.type,
        injuryDate: injuryDateISO,
        estimatedDuration: parseInt(editData.estimatedDuration),
        status: editData.status,
        recoveryProgress: parseInt(editData.recoveryProgress),
        activityRestrictions: editData.activityRestrictions,
        notes: editData.notes,
      };
      console.log('Updating Injury Data:', injuryData); // Depanare

      const updatedInjury = await updateInjury(selectedInjury._id, injuryData);
      setInjuries(injuries.map(injury =>
        injury._id === updatedInjury._id ? updatedInjury : injury
      ));
      setSelectedInjury(null); // Închide modalul
      setIsEditing(false);
      setEditData({
        playerId: '',
        type: '',
        injuryDate: '',
        estimatedDuration: '',
        status: 'injured',
        recoveryProgress: 0,
        activityRestrictions: '',
        notes: '',
      });
      toast.success('Injury updated successfully!', {
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
      console.error('Error updating injury:', error); // Depanare
      toast.error(error.message || 'Error updating the injury.', {
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

  const handleEditToggle = () => {
    if (isEditing) {
      setEditData({
        playerId: '',
        type: '',
        injuryDate: '',
        estimatedDuration: '',
        status: 'injured',
        recoveryProgress: 0,
        activityRestrictions: '',
        notes: '',
      });
    } else {
      setEditData({
        type: selectedInjury.type,
        injuryDate: convertToDDMMYYYY(selectedInjury.injuryDate), 
        estimatedDuration: selectedInjury.estimatedDuration,
        status: selectedInjury.status,
        recoveryProgress: selectedInjury.recoveryProgress,
        activityRestrictions: selectedInjury.activityRestrictions || '',
        notes: selectedInjury.notes || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleCreateToggle = () => {
    setIsCreating(!isCreating);
    setEditData({
      playerId: '',
      type: '',
      injuryDate: '',
      estimatedDuration: '',
      status: 'injured',
      recoveryProgress: 0,
      activityRestrictions: '',
      notes: '',
    });
  };

  if (loading) return <div className="injury-loading">Loading...</div>;

  return (
    <section className="injury-section">
      <h2>Injured Players</h2>
      {userRole === 'staff' && (
        <div className="injury-action-buttons">
          <button className="injury-add-btn" onClick={handleCreateToggle}>
            Add injury
          </button>
        </div>
      )}
      {injuries.length > 0 ? (
        <div className="injury-card-container">
          {injuries.map((injury) => (
            <div key={injury._id} className="injury-card">
              <div className="injury-card-header">
                <h3>{`${injury.playerId?.firstName} ${injury.playerId?.lastName}`}</h3>
                <span className={`injury-card-status ${injury.status}`}>
                  {injury.status === 'injured' ? 'Injured' : 'Recovering'}
                </span>
              </div>
              <div className="injury-card-info">
                <p><strong>Type:</strong> {injury.type}</p>
                <p><strong>Date:</strong> {new Date(injury.injuryDate).toLocaleDateString('ro-RO')}</p>
                <p><strong>Duration:</strong> {injury.estimatedDuration} days</p>
                <p><strong>Recovery:</strong> {new Date(injury.recoveryEndDate).toLocaleDateString('ro-RO')}</p>
                <p><strong>Restrictions:</strong> {injury.activityRestrictions || 'N/A'}</p>
              </div>
              <div className="injury-progress-bar">
                <div
                  className="injury-progress-fill"
                  style={{ width: `${injury.recoveryProgress}%` }}
                ></div>
              </div>
              <button
                className="injury-details-btn"
                onClick={() => {
                  setSelectedInjury(injury);
                }}
              >
                Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="injury-no-injuries">No active injuries.</p>
      )}
      {(selectedInjury || isCreating) && (
        <div className="injury-modal-container" onClick={() => {
          setSelectedInjury(null);
          setIsCreating(false);
          setIsEditing(false);
          setEditData({
            playerId: '',
            type: '',
            injuryDate: '',
            estimatedDuration: '',
            status: 'injured',
            recoveryProgress: 0,
            activityRestrictions: '',
            notes: '',
          });
        }}>
          <div className="injury-modal-content" onClick={e => e.stopPropagation()}>
            {isCreating ? (
              <>
                <h3>Add Injury</h3>
                <form onSubmit={handleCreateSubmit} className="injury-edit-form">
                  <div className="injury-form-group">
                    <label>Player:</label>
                    <select
                      value={editData.playerId}
                      onChange={(e) => setEditData({ ...editData, playerId: e.target.value })}
                      className="injury-edit-input"
                      required
                    >
                      <option value="">Select player</option>
                      {players.map(player => (
                        <option key={player._id} value={player.playerId._id}>
                          {`${player.playerId.firstName} ${player.playerId.lastName}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="injury-form-group">
                    <label>Injury Type:</label>
                    <input
                      type="text"
                      value={editData.type}
                      onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                      className="injury-edit-input"
                      placeholder="e.g., ankle sprain"
                      required
                    />
                  </div>
                  <div className="injury-form-group">
                    <label>Injury Date (dd/mm/yyyy):</label>
                    <input
                      type="text"
                      value={editData.injuryDate}
                      onChange={(e) => setEditData({ ...editData, injuryDate: e.target.value })}
                      className="injury-edit-input"
                      placeholder="dd/mm/yyyy"
                      required
                    />
                  </div>
                  <div className="injury-form-group">
                    <label>Estimated Duration (days):</label>
                    <input
                      type="number"
                      value={editData.estimatedDuration}
                      onChange={(e) => setEditData({ ...editData, estimatedDuration: e.target.value })}
                      className="injury-edit-input"
                      min="1"
                      required
                    />
                  </div>
                  <div className="injury-form-group">
                    <label>Activity Restrictions:</label>
                    <textarea
                      value={editData.activityRestrictions}
                      onChange={(e) => setEditData({ ...editData, activityRestrictions: e.target.value })}
                      className="injury-edit-input"
                      placeholder="e.g., complete rest"
                    />
                  </div>
                  <div className="injury-form-group">
                    <label>Notes:</label>
                    <textarea
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      className="injury-edit-input"
                      placeholder="e.g., good progress"
                    />
                  </div>
                  <div className="injury-modal-actions">
                    <button type="submit" className="injury-save-btn">Save</button>
                    <button type="button" className="injury-cancel-btn" onClick={handleCreateToggle}>Cancel</button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3>{`${selectedInjury.playerId?.firstName} ${selectedInjury.playerId?.lastName}`}</h3>
                {isEditing ? (
                  <form onSubmit={handleEditSubmit} className="injury-edit-form">
                    <div className="injury-form-group">
                      <label>Injury Type:</label>
                      <input
                        type="text"
                        value={editData.type}
                        onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                        className="injury-edit-input"
                        placeholder="e.g., ankle sprain"
                      />
                    </div>
                    <div className="injury-form-group">
                      <label>Injury Date (dd/mm/yyyy):</label>
                      <input
                        type="text"
                        value={editData.injuryDate}
                        onChange={(e) => setEditData({ ...editData, injuryDate: e.target.value })}
                        className="injury-edit-input"
                        placeholder="dd/mm/yyyy"
                      />
                    </div>
                    <div className="injury-form-group">
                      <label>Estimated Duration (days):</label>
                      <input
                        type="number"
                        value={editData.estimatedDuration}
                        onChange={(e) => setEditData({ ...editData, estimatedDuration: e.target.value })}
                        className="injury-edit-input"
                        min="1"
                      />
                    </div>
                    <div className="injury-form-group">
                      <label>Status:</label>
                      <select
                        value={editData.status}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                        className="injury-edit-input"
                      >
                        <option value="injured">Injured</option>
                        <option value="recovering">Recovering</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                    <div className="injury-form-group">
                      <label>Recovery Progress (%):</label>
                      <input
                        type="number"
                        value={editData.recoveryProgress}
                        onChange={(e) => setEditData({ ...editData, recoveryProgress: e.target.value })}
                        className="injury-edit-input"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="injury-form-group">
                      <label>Activity Restrictions:</label>
                      <textarea
                        value={editData.activityRestrictions}
                        onChange={(e) => setEditData({ ...editData, activityRestrictions: e.target.value })}
                        className="injury-edit-input"
                        placeholder="e.g., physiotherapy, light running"
                      />
                    </div>
                    <div className="injury-form-group">
                      <label>Notes:</label>
                      <textarea
                        value={editData.notes}
                        onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                        className="injury-edit-input"
                        placeholder="e.g., good progress"
                      />
                    </div>
                    <div className="injury-modal-actions">
                      <button type="submit" className="injury-save-btn">Save</button>
                      <button type="button" className="injury-cancel-btn" onClick={handleEditToggle}>Close</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p><strong>Injury type:</strong> {selectedInjury.type}</p>
                    <p><strong>Injury Date:</strong> {new Date(selectedInjury.injuryDate).toLocaleDateString('ro-RO')}</p>
                    <p><strong>Estimated Duration:</strong> {selectedInjury.estimatedDuration} days</p>
                    <p><strong>Estimated Recovery Date:</strong> {new Date(selectedInjury.recoveryEndDate).toLocaleDateString('ro-RO')}</p>
                    <p><strong>Status:</strong> {selectedInjury.status === 'injured' ? 'Injured' : selectedInjury.status === 'recovering' ? 'Recovering' : 'Resolved'}</p>
                    <p><strong>Recovery Progress:</strong> {selectedInjury.recoveryProgress}%</p>
                    <div className="injury-progress-bar">
                      <div
                        className="injury-progress-fill"
                        style={{ width: `${selectedInjury.recoveryProgress}%` }}
                      ></div>
                    </div>
                    <p><strong>Activity Restrictions:</strong> {selectedInjury.activityRestrictions || 'N/A'}</p>
                    <p><strong>Notes:</strong> {selectedInjury.notes || 'N/A'}</p>
                    <div className="injury-modal-actions">
                      {userRole === 'staff' && (
                        <button className="injury-edit-btn" onClick={handleEditToggle}>Edit</button>
                      )}
                      <button className="injury-close-modal-btn" onClick={() => {
                        setSelectedInjury(null);
                        setIsEditing(false);
                        setEditData({
                          playerId: '',
                          type: '',
                          injuryDate: '',
                          estimatedDuration: '',
                          status: 'injured',
                          recoveryProgress: 0,
                          activityRestrictions: '',
                          notes: '',
                        });
                      }}>Close</button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default InjuredPlayersList;