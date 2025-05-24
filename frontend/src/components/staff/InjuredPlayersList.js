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
        toast.error('Eroare la încărcarea datelor', {
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
      document.body.style.overflow = 'hidden'; // Oprește scroll-ul
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
        document.body.style.overflow = 'auto'; // Restabilește scroll-ul
        document.removeEventListener('keydown', handleEsc);
      };
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [selectedInjury, isCreating]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const injuryData = {
        playerId: editData.playerId,
        type: editData.type,
        injuryDate: editData.injuryDate,
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
      // Afișează toast-ul după închiderea modalului
      toast.success('Accidentare creată cu succes!', {
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
      console.error('Error creating injury:', error); // Depanare
      toast.error(error.message || 'Eroare la crearea accidentării.', {
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
      const injuryData = {
        type: editData.type,
        injuryDate: editData.injuryDate,
        estimatedDuration: parseInt(editData.estimatedDuration),
        status: editData.status,
        recoveryProgress: parseInt(editData.recoveryProgress),
        activityRestrictions: editData.activityRestrictions,
        notes: editData.notes,
      };
      console.log('Updating Injury Data:', injuryData); // Depanare

      const updatedInjury = await updateInjury(selectedInjury._id, injuryData);
      console.log('Updated Injury Response:', updatedInjury); // Depanare
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
      // Afișează toast-ul după închiderea modalului
      toast.success('Accidentare actualizată cu succes!', {
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
      toast.error(error.message || 'Eroare la actualizarea accidentării.', {
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
        injuryDate: selectedInjury.injuryDate.split('T')[0],
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

  if (loading) return <div className="injury-loading">Se încarcă...</div>;

  return (
    <section className="injury-section">
      <h2>Accidentări Jucători</h2>
      {userRole === 'staff' && (
        <div className="injury-action-buttons">
          <button className="injury-add-btn" onClick={handleCreateToggle}>
            Adaugă Accidentare
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
                  {injury.status === 'injured' ? 'Accidentat' : 'În recuperare'}
                </span>
              </div>
              <div className="injury-card-info">
                <p><strong>Tip:</strong> {injury.type}</p>
                <p><strong>Data:</strong> {new Date(injury.injuryDate).toLocaleDateString('ro-RO')}</p>
                <p><strong>Durata:</strong> {injury.estimatedDuration} zile</p>
                <p><strong>Revenire:</strong> {new Date(injury.recoveryEndDate).toLocaleDateString('ro-RO')}</p>
                <p><strong>Restricții:</strong> {injury.activityRestrictions || 'N/A'}</p>
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
                  console.log('Selected Injury:', injury); // Depanare
                }}
              >
                Detalii
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="injury-no-injuries">Nu există accidentări active.</p>
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
                <h3>Adaugă Accidentare</h3>
                <form onSubmit={handleCreateSubmit} className="injury-edit-form">
                  <div className="injury-form-group">
                    <label>Jucător:</label>
                    <select
                      value={editData.playerId}
                      onChange={(e) => setEditData({ ...editData, playerId: e.target.value })}
                      className="injury-edit-input"
                      required
                    >
                      <option value="">Selectează jucător</option>
                      {players.map(player => (
                        <option key={player._id} value={player.playerId._id}>
                          {`${player.playerId.firstName} ${player.playerId.lastName}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="injury-form-group">
                    <label>Tip Accidentare:</label>
                    <input
                      type="text"
                      value={editData.type}
                      onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                      className="injury-edit-input"
                      placeholder="Ex. entorsă glezna"
                      required
                    />
                  </div>
                  <div className="injury-form-group">
                    <label>Data Accidentării:</label>
                    <input
                      type="date"
                      value={editData.injuryDate}
                      onChange={(e) => setEditData({ ...editData, injuryDate: e.target.value })}
                      className="injury-edit-input"
                      required
                    />
                  </div>
                  <div className="injury-form-group">
                    <label>Durata Estimată (zile):</label>
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
                    <label>Restricții Activitate:</label>
                    <textarea
                      value={editData.activityRestrictions}
                      onChange={(e) => setEditData({ ...editData, activityRestrictions: e.target.value })}
                      className="injury-edit-input"
                      placeholder="Ex. odihnă completă"
                    />
                  </div>
                  <div className="injury-form-group">
                    <label>Note:</label>
                    <textarea
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      className="injury-edit-input"
                      placeholder="Ex. progres bun"
                    />
                  </div>
                  <div className="injury-modal-actions">
                    <button type="submit" className="injury-save-btn">Salvează</button>
                    <button type="button" className="injury-cancel-btn" onClick={handleCreateToggle}>Anulează</button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3>{`${selectedInjury.playerId?.firstName} ${selectedInjury.playerId?.lastName}`}</h3>
                {isEditing ? (
                  <form onSubmit={handleEditSubmit} className="injury-edit-form">
                    <div className="injury-form-group">
                      <label>Tip Accidentare:</label>
                      <input
                        type="text"
                        value={editData.type}
                        onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                        className="injury-edit-input"
                        placeholder="Ex. entorsă glezna"
                      />
                    </div>
                    <div className="injury-form-group">
                      <label>Data Accidentării:</label>
                      <input
                        type="date"
                        value={editData.injuryDate}
                        onChange={(e) => setEditData({ ...editData, injuryDate: e.target.value })}
                        className="injury-edit-input"
                      />
                    </div>
                    <div className="injury-form-group">
                      <label>Durata Estimată (zile):</label>
                      <input
                        type="number"
                        value={editData.estimatedDuration}
                        onChange={(e) => setEditData({ ...editData, estimatedDuration: e.target.value })}
                        className="injury-edit-input"
                        min="1"
                      />
                    </div>
                    <div className="injury-form-group">
                      <label>Stare:</label>
                      <select
                        value={editData.status}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                        className="injury-edit-input"
                      >
                        <option value="injured">Accidentat</option>
                        <option value="recovering">În recuperare</option>
                        <option value="resolved">Rezolvat</option>
                      </select>
                    </div>
                    <div className="injury-form-group">
                      <label>Progres Recuperare (%):</label>
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
                      <label>Restricții Activitate:</label>
                      <textarea
                        value={editData.activityRestrictions}
                        onChange={(e) => setEditData({ ...editData, activityRestrictions: e.target.value })}
                        className="injury-edit-input"
                        placeholder="Ex. fizioterapie, alergare ușoară"
                      />
                    </div>
                    <div className="injury-form-group">
                      <label>Note:</label>
                      <textarea
                        value={editData.notes}
                        onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                        className="injury-edit-input"
                        placeholder="Ex. progres bun"
                      />
                    </div>
                    <div className="injury-modal-actions">
                      <button type="submit" className="injury-save-btn">Salvează</button>
                      <button type="button" className="injury-cancel-btn" onClick={handleEditToggle}>Anulează</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p><strong>Tip Accidentare:</strong> {selectedInjury.type}</p>
                    <p><strong>Data Accidentării:</strong> {new Date(selectedInjury.injuryDate).toLocaleDateString('ro-RO')}</p>
                    <p><strong>Durata Estimată:</strong> {selectedInjury.estimatedDuration} zile</p>
                    <p><strong>Data Estimată de Revenire:</strong> {new Date(selectedInjury.recoveryEndDate).toLocaleDateString('ro-RO')}</p>
                    <p><strong>Stare:</strong> {selectedInjury.status === 'injured' ? 'Accidentat' : selectedInjury.status === 'recovering' ? 'În recuperare' : 'Rezolvat'}</p>
                    <p><strong>Progres Recuperare:</strong> {selectedInjury.recoveryProgress}%</p>
                    <div className="injury-progress-bar">
                      <div
                        className="injury-progress-fill"
                        style={{ width: `${selectedInjury.recoveryProgress}%` }}
                      ></div>
                    </div>
                    <p><strong>Restricții Activitate:</strong> {selectedInjury.activityRestrictions || 'N/A'}</p>
                    <p><strong>Note:</strong> {selectedInjury.notes || 'N/A'}</p>
                    {userRole === 'staff' && (
                      <button className="injury-edit-btn" onClick={handleEditToggle}>Editează</button>
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
                    }}>Închide</button>
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