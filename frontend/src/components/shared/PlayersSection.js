import React, { useState, useEffect } from 'react';
import { fetchPlayers } from '../../services/userService';
import { fetchInjuries } from '../../services/injuryService';
import '../../styles/shared/PlayersSection.css';

const PlayersSection = ({ onPlayerClick, currentUserId }) => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [injuries, setInjuries] = useState([]);

  useEffect(() => {
    const loadPlayersAndInjuries = async () => {
      try {
        setLoading(true);
        const [users, injuryData] = await Promise.all([fetchPlayers(), fetchInjuries()]);
        console.log('Players fetched:', users); 
        console.log('Injuries fetched:', injuryData); // Verify playerId._id
        setPlayers(users);
        setFilteredPlayers(users);
        setInjuries(injuryData);
      } catch (err) {
        setError('Error loading players or injuries.');
      } finally {
        setLoading(false);
      }
    };
    loadPlayersAndInjuries();
  }, []);

  useEffect(() => {
    const filtered = players.filter(player =>
      player.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
    setFilteredPlayers(filtered);
  }, [searchTerm, players]);

  // Updated injury check to match playerId._id with injury.playerId._id
  const isPlayerInjured = (playerId) => {
    const player = players.find(p => p._id === playerId);
    const playerPlayerId = player?.playerId?._id?.toString();
    return injuries.some(injury => 
      injury.playerId && injury.playerId._id && injury.playerId._id.toString() === playerPlayerId && 
      injury.status !== 'resolved'
    );
  };

  const goalkeepers = filteredPlayers.filter(player => player.playerId?.position === 'Goalkeeper');
  const defenders = filteredPlayers.filter(player => player.playerId?.position === 'Defender');
  const midfielders = filteredPlayers.filter(player => player.playerId?.position === 'Midfielder');
  const forwards = filteredPlayers.filter(player => player.playerId?.position === 'Forward');

  const renderPlayerCategory = (categoryPlayers, categoryTitle) => (
    categoryPlayers.length > 0 && (
      <div className="player-category">
        <h2>{categoryTitle}</h2>
        <div className="players-list">
          {categoryPlayers.map(player => (
            <div
              key={player._id}
              className={`player-card ${player._id === currentUserId ? 'current-user' : ''}`}
              onClick={() => onPlayerClick(player)}
            >
              <div className="player-image-wrapper">
                <div className="background-logo"></div>
                <img
                  src={
                    player.playerId?.image
                      ? `${process.env.REACT_APP_URL}${player.playerId.image}`
                      : '/images/default-user.jpg'
                  }
                  alt={player.name}
                  className="player-image"
                  draggable="false"
                  onError={(e) => {
                    e.target.src = '/images/default-user.jpg';
                  }}
                />
                {isPlayerInjured(player._id) && (
                  <div className="injury-icon">
                    <svg
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ff4040" 
                    strokeWidth="4"  
                  >
                    <path d="M12 4V20" /> {/* Vertical line */}
                    <path d="M4 12H20" /> {/* Horizontal line */}
                  </svg>
                  </div>
                )}
              </div>
              <div className="player-info">
                <span className="player-number">{player.playerId?.shirtNumber || 'N/A'}</span>
                <span className="player-name">{player.name.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) return <div className="loading-message">Loading players...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (players.length === 0) return <div className="no-players-message">No players in the squad.</div>;

  return (
    <div className="players-section">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search player by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {filteredPlayers.length === 0 && searchTerm && (
        <div className="no-results">No players found for “{searchTerm}”.</div>
      )}
      {renderPlayerCategory(goalkeepers, 'Goalkeepers')}
      {renderPlayerCategory(defenders, 'Defenders')}
      {renderPlayerCategory(midfielders, 'Midfielders')}
      {renderPlayerCategory(forwards, 'Forwards')}
    </div>
  );
};

export default PlayersSection;