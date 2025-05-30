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
        console.log('Players Loaded:', playerData); // Debugging: Check player data
        setPlayers(playerData);
      } catch (error) {
        toast.error('Error loading players', {
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
      document.body.style.overflow = 'hidden'; // Disable external scroll
      const handleEsc = (e) => {
        if (e.key === 'Escape') {
          setSelectedPlayer(null);
          setIsEditing(false);
          setEditData({ weight: '', height: '' });
        }
      };
      document.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = 'auto'; // Restore scroll
        document.removeEventListener('keydown', handleEsc); // Clean up listener
      };
    } else {
      document.body.style.overflow = 'auto'; // Ensure normal scroll when modal is closed
    }
  }, [selectedPlayer]);
 
  const calculateBMI = (player) => {
    if (!player.playerId?.weight || !player.playerId?.height) return { value: 'N/A', category: 'N/A' };
    const heightInMeters = player.playerId.height / 100;
    const bmi = player.playerId.weight / (heightInMeters * heightInMeters);
    const category = bmi < 20 ? 'Underweight' : bmi < 26 ? 'Normal' : bmi < 31 ? 'Muscular' : 'Overweight';
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
    
    if (bmiData.category === 'Underweight') {
      recommended = maintenance + 500;
      recommendationText = ' (+500 kcal/day for weight gain)';
    } else if (bmiData.category === 'Overweight') {
      recommended = maintenance - 500;
      recommendationText = ' (-500 kcal/day for weight loss)';
    }
    
    return { maintenance: `${maintenance} kcal/day`, recommended: `${recommended} kcal/day${recommendationText}` };
  };

  const getRecommendations = (bmiCategory) => {
    switch (bmiCategory) {
      case 'Underweight':
        return 'Increase protein and complex carbohydrate intake to support muscle mass gain. Include frequent meals and calorie-dense healthy snacks (e.g., nuts, avocado).';
      case 'Overweight':
        return 'Reduce calorie intake by limiting saturated fats and sugars. Focus on lean proteins, vegetables, and fiber. Increase aerobic physical activity.';
      case 'Normal':
        return 'Maintain a balanced diet with proteins, carbohydrates, and healthy fats to support athletic performance.';
      case 'Muscular':
        return 'Continue prioritizing proteins for muscle mass maintenance and carbohydrates for energy. Monitor weight monthly.';
      default:
        return 'Insufficient data for recommendations.';
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'BMI', 'Daily Calories', 'Recommended Calories'];
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
      toast.error('Weight and height must be positive numbers.', {
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

      toast.success('Player data updated successfully!', {
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
      toast.error(error.message || 'Error updating player data.', {
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
    console.log('Toggling edit mode. Current isEditing:', isEditing, 'User Role:', userRole); // Debugging
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

  if (loading) return <div className="nutrition-loading">Loading...</div>;

  return (
    <section className="nutrition-section">
      <div className="nutrition-action-buttons">
        <button className="nutrition-export-csv-btn" onClick={handleExportCSV}>
          Export CSV
        </button>
      </div>
      {players.length > 0 ? (
        <table className="nutrition-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>BMI</th>
              <th>Daily Calories</th>
              <th>Recommended Calories</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              const bmiData = calculateBMI(player);
              const caloriesData = calculateCalories(player);
              const rowClass = bmiData.category === 'Underweight' ? 'nutrition-highlight-underweight' : bmiData.category === 'Overweight' ? 'nutrition-highlight-overweight' : '';
              return (
                <tr key={player._id} className={rowClass} title={bmiData.category === 'Underweight' ? 'This player is underweight (BMI < 20)' : bmiData.category === 'Overweight' ? 'This player is overweight (BMI ≥ 31)' : ''}>
                  <td>{`${player.playerId?.firstName} ${player.playerId?.lastName}`}</td>
                  <td>{bmiData.value !== 'N/A' ? `${bmiData.value} (${bmiData.category})` : 'N/A'}</td>
                  <td>{caloriesData.maintenance}</td>
                  <td>{caloriesData.recommended}</td>
                  <td>
                    <button
                      className="nutrition-details-btn"
                      onClick={() => {
                        setSelectedPlayer(player);
                        console.log('Selected Player:', player); // Debugging
                      }}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="nutrition-no-players">No players available.</p>
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
                  <label>Weight (kg):</label>
                  <input
                    type="number"
                    value={editData.weight}
                    onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
                    className="nutrition-edit-input"
                    min="0"
                    step="0.1"
                    placeholder="Enter weight"
                  />
                </div>
                <div className="nutrition-form-group">
                  <label>Height (cm):</label>
                  <input
                    type="number"
                    value={editData.height}
                    onChange={(e) => setEditData({ ...editData, height: e.target.value })}
                    className="nutrition-edit-input"
                    min="0"
                    step="1"
                    placeholder="Enter height"
                  />
                </div>
                <div className="nutrition-modal-actions">
                  <button type="submit" className="nutrition-save-btn">Save</button>
                  <button type="button" className="nutrition-cancel-btn" onClick={handleEditToggle}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <p><strong>Age:</strong> {calculateAge(selectedPlayer.playerId?.dateOfBirth) || 'N/A'} years</p>
                <p><strong>Weight:</strong> {selectedPlayer.playerId?.weight || 'N/A'} kg</p>
                <p><strong>Height:</strong> {selectedPlayer.playerId?.height || 'N/A'} cm</p>
                <p><strong>BMI:</strong> {calculateBMI(selectedPlayer).value !== 'N/A' ? `${calculateBMI(selectedPlayer).value} (${calculateBMI(selectedPlayer).category})` : 'N/A'}</p>
                <p><strong>BMR:</strong> {selectedPlayer.playerId?.weight && selectedPlayer.playerId?.height && selectedPlayer.playerId?.dateOfBirth ? Math.round(10 * selectedPlayer.playerId.weight + 6.25 * selectedPlayer.playerId.height - 5 * calculateAge(selectedPlayer.playerId.dateOfBirth) + 5) + ' kcal/day' : 'N/A'}</p>
                <p><strong>Daily Calories:</strong> {calculateCalories(selectedPlayer).maintenance}</p>
                <p><strong>Recommended Calories:</strong> {calculateCalories(selectedPlayer).recommended}</p>
                <p><strong>Recommendations:</strong> {getRecommendations(calculateBMI(selectedPlayer).category)}</p>
                {userRole?.toLowerCase() === 'staff' && (
                  <button className="nutrition-edit-btn" onClick={handleEditToggle}>
                    Edit height/weight
                  </button>
                )}
                <button className="nutrition-close-modal-btn" onClick={() => {
                  setSelectedPlayer(null);
                  setIsEditing(false);
                  setEditData({ weight: '', height: '' });
                }}>Close</button>
              </>
            )}
            {console.log('Modal Rendered:', selectedPlayer, 'User Role:', userRole, 'Is Editing:', isEditing)} {/* Debugging */}
          </div>
        </div>
      )}
    </section>
  );
};

export default PlayerNutritionList;