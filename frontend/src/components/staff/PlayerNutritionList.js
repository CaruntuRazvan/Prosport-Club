import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchPlayers, updatePlayerNutrition } from '../../services/userService';
import '../../styles/staff/PlayerNutritionList.css';

const PlayerNutritionList = ({ calculateAge, userRole }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [editData, setEditData] = useState({ weight: '', height: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setLoading(true);
        const playerData = await fetchPlayers();
        console.log('Players Loaded:', playerData); // Depanare: Verifică datele jucătorilor
        setPlayers(playerData);
      } catch (error) {
        toast.error('Eroare la încărcarea jucătorilor', {
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
        console.error('Error fetching players:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, []);
  useEffect(() => {
    if (selectedPlayer) {
      document.body.style.overflow = 'hidden'; // Oprește scroll-ul exterior
      const handleEsc = (e) => {
        if (e.key === 'Escape') {
          setSelectedPlayer(null);
          setIsEditing(false);
          setEditData({ weight: '', height: '' });
        }
      };
      document.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = 'auto'; // Restabilește scroll-ul
        document.removeEventListener('keydown', handleEsc); // Curăță listener-ul
      };
    } else {
      document.body.style.overflow = 'auto'; // Asigură scroll normal când modalul e închis
    }
  }, [selectedPlayer]);
 
  const calculateBMI = (player) => {
    if (!player.playerId?.weight || !player.playerId?.height) return { value: 'N/A', category: 'N/A' };
    const heightInMeters = player.playerId.height / 100;
    const bmi = player.playerId.weight / (heightInMeters * heightInMeters);
    const category = bmi < 20 ? 'Subponderal' : bmi < 26 ? 'Normal' : bmi < 31 ? 'Muscular' : 'Supraponderal';
    return { value: bmi.toFixed(1), category };
  };

  const calculateCalories = (player) => {
    if (!player.playerId?.weight || !player.playerId?.height || !player.playerId?.dateOfBirth) return { maintenance: 'N/A', recommended: 'N/A' };
    const age = calculateAge(player.playerId.dateOfBirth);
    const weight = player.playerId.weight;
    const height = player.playerId.height;
    const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    const activityLevel = 1.9;
    const maintenance = Math.round(bmr * activityLevel);
    
    const bmiData = calculateBMI(player);
    let recommended = maintenance;
    let recommendationText = '';
    
    if (bmiData.category === 'Subponderal') {
      recommended = maintenance + 500;
      recommendationText = ' (+500 kcal/zi pentru creștere)';
    } else if (bmiData.category === 'Supraponderal') {
      recommended = maintenance - 500;
      recommendationText = ' (-500 kcal/zi pentru slăbire)';
    }
    
    return { maintenance: `${maintenance} kcal/zi`, recommended: `${recommended} kcal/zi${recommendationText}` };
  };

  const getRecommendations = (bmiCategory) => {
    switch (bmiCategory) {
      case 'Subponderal':
        return 'Crește aportul de proteine și carbohidrați complecși pentru a susține creșterea masei musculare. Include mese frecvente și gustări bogate în calorii sănătoase (ex. nuci, avocado).';
      case 'Supraponderal':
        return 'Redu aportul de calorii prin limitarea grăsimilor saturate și zaharurilor. Concentrează-te pe proteine slabe, legume și fibre. Crește activitatea fizică aerobă.';
      case 'Normal':
        return 'Menține o dietă echilibrată cu proteine, carbohidrați și grăsimi sănătoase pentru a susține performanța atletică.';
      case 'Muscular':
        return 'Continuă să prioritizezi proteinele pentru menținerea masei musculare și carbohidrați pentru energie. Monitorizează greutatea lunar.';
      default:
        return 'Date insuficiente pentru recomandări.';
    }
  };

  const handleExportCSV = () => {
    const headers = ['Nume', 'BMI', 'Calorii Zilnice', 'Calorii Recomandate'];
    const rows = players.map(player => {
      const bmiData = calculateBMI(player);
      const caloriesData = calculateCalories(player);
      return [
        `"${player.playerId?.firstName} ${player.playerId?.lastName}"`,
        bmiData.value !== 'N/A' ? `${bmiData.value} (${bmiData.category})` : 'N/A',
        caloriesData.maintenance,
        caloriesData.recommended
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nutrition_players_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlayer) return;

    const weight = parseFloat(editData.weight);
    const height = parseFloat(editData.height);

    if ((weight && weight <= 0) || (height && height <= 0)) {
      toast.error('Greutatea și înălțimea trebuie să fie numere pozitive.', {
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
      return;
    }

    try {
      const updatedPlayer = await updatePlayerNutrition(selectedPlayer.playerId._id, {
        weight: weight || undefined,
        height: height || undefined,
      });

      setPlayers(players.map(player =>
        player.playerId._id === selectedPlayer.playerId._id
          ? {
              ...player,
              playerId: {
                ...player.playerId,
                weight: updatedPlayer.weight,
                height: updatedPlayer.height,
              },
            }
          : player
      ));

      toast.success('Datele jucătorului au fost actualizate cu succes!', {
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

      setIsEditing(false);
      setEditData({ weight: '', height: '' });
      setSelectedPlayer(null);
    } catch (error) {
      toast.error(error.message || 'Eroare la actualizarea datelor jucătorului.', {
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
    console.log('Toggling edit mode. Current isEditing:', isEditing, 'User Role:', userRole); // Depanare
    if (isEditing) {
      setEditData({ weight: '', height: '' });
    } else {
      setEditData({
        weight: selectedPlayer.playerId?.weight || '',
        height: selectedPlayer.playerId?.height || '',
      });
    }
    setIsEditing(!isEditing);
  };

  if (loading) return <div className="nutrition-loading">Se încarcă...</div>;

  return (
    <section className="nutrition-section">
      <div className="nutrition-action-buttons">
        <button className="nutrition-export-csv-btn" onClick={handleExportCSV}>
          Exportă CSV
        </button>
      </div>
      {players.length > 0 ? (
        <table className="nutrition-table">
          <thead>
            <tr>
              <th>Nume</th>
              <th>BMI</th>
              <th>Calorii Zilnice</th>
              <th>Calorii Recomandate</th>
              <th>Detalii</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              const bmiData = calculateBMI(player);
              const caloriesData = calculateCalories(player);
              const rowClass = bmiData.category === 'Subponderal' ? 'nutrition-highlight-underweight' : bmiData.category === 'Supraponderal' ? 'nutrition-highlight-overweight' : '';
              return (
                <tr key={player._id} className={rowClass} title={bmiData.category === 'Subponderal' ? 'Acest jucător este subponderal (BMI < 20)' : bmiData.category === 'Supraponderal' ? 'Acest jucător este supraponderal (BMI ≥ 31)' : ''}>
                  <td>{`${player.playerId?.firstName} ${player.playerId?.lastName}`}</td>
                  <td>{bmiData.value !== 'N/A' ? `${bmiData.value} (${bmiData.category})` : 'N/A'}</td>
                  <td>{caloriesData.maintenance}</td>
                  <td>{caloriesData.recommended}</td>
                  <td>
                    <button
                      className="nutrition-details-btn"
                      onClick={() => {
                        setSelectedPlayer(player);
                        console.log('Selected Player:', player); // Depanare
                      }}
                    >
                      Detalii
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="nutrition-no-players">Nu există jucători disponibili.</p>
      )}
      {selectedPlayer && (
        <div className="nutrition-modal-container" onClick={() => {
          setSelectedPlayer(null);
          setIsEditing(false);
          setEditData({ weight: '', height: '' });
        }}>
          <div className="nutrition-modal-content" onClick={e => e.stopPropagation()}>
            <h3>{`${selectedPlayer.playerId?.firstName} ${selectedPlayer.playerId?.lastName}`}</h3>
            {isEditing && userRole?.toLowerCase() === 'staff' ? (
              <form onSubmit={handleEditSubmit} className="nutrition-edit-form">
                <div className="nutrition-form-group">
                  <label>Greutate (kg):</label>
                  <input
                    type="number"
                    value={editData.weight}
                    onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
                    className="nutrition-edit-input"
                    min="0"
                    step="0.1"
                    placeholder="Introdu greutatea"
                  />
                </div>
                <div className="nutrition-form-group">
                  <label>Înălțime (cm):</label>
                  <input
                    type="number"
                    value={editData.height}
                    onChange={(e) => setEditData({ ...editData, height: e.target.value })}
                    className="nutrition-edit-input"
                    min="0"
                    step="1"
                    placeholder="Introdu înălțimea"
                  />
                </div>
                <div className="nutrition-modal-actions">
                  <button type="submit" className="nutrition-save-btn">Salvează</button>
                  <button type="button" className="nutrition-cancel-btn" onClick={handleEditToggle}>Anulează</button>
                </div>
              </form>
            ) : (
              <>
                <p><strong>Vârstă:</strong> {calculateAge(selectedPlayer.playerId?.dateOfBirth) || 'N/A'} ani</p>
                <p><strong>Greutate:</strong> {selectedPlayer.playerId?.weight || 'N/A'} kg</p>
                <p><strong>Înălțime:</strong> {selectedPlayer.playerId?.height || 'N/A'} cm</p>
                <p><strong>BMI:</strong> {calculateBMI(selectedPlayer).value !== 'N/A' ? `${calculateBMI(selectedPlayer).value} (${calculateBMI(selectedPlayer).category})` : 'N/A'}</p>
                <p><strong>BMR:</strong> {selectedPlayer.playerId?.weight && selectedPlayer.playerId?.height && selectedPlayer.playerId?.dateOfBirth ? Math.round(10 * selectedPlayer.playerId.weight + 6.25 * selectedPlayer.playerId.height - 5 * calculateAge(selectedPlayer.playerId.dateOfBirth) + 5) + ' kcal/zi' : 'N/A'}</p>
                <p><strong>Calorii Zilnice:</strong> {calculateCalories(selectedPlayer).maintenance}</p>
                <p><strong>Calorii Recomandate:</strong> {calculateCalories(selectedPlayer).recommended}</p>
                <p><strong>Recomandări:</strong> {getRecommendations(calculateBMI(selectedPlayer).category)}</p>
                {userRole?.toLowerCase() === 'staff' && (
                  <button className="nutrition-edit-btn" onClick={handleEditToggle}>
                    Edit height/weight
                  </button>
                )}
                <button className="nutrition-close-modal-btn" onClick={() => {
                  setSelectedPlayer(null);
                  setIsEditing(false);
                  setEditData({ weight: '', height: '' });
                }}>Închide</button>
              </>
            )}
            {console.log('Modal Rendered. Selected Player:', selectedPlayer, 'User Role:', userRole, 'Is Editing:', isEditing)} {/* Depanare */}
          </div>
        </div>
      )}
    </section>
  );
};

export default PlayerNutritionList;