import React, { useState, useEffect } from 'react';
import { fetchPlayers } from '../../services/userService';
import '../../styles/shared/PlayersSection.css';

const PlayersSection = ({ onPlayerClick, currentUserId }) => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]); // State pentru jucătorii filtrați
  const [searchTerm, setSearchTerm] = useState(''); // State pentru valoarea din search bar
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setLoading(true);
        const users = await fetchPlayers();
        console.log('Jucători preluați:', users);
        setPlayers(users);
        setFilteredPlayers(users); // Inițial, jucătorii filtrați sunt toți jucătorii
      } catch (err) {
        setError('Eroare la încărcarea jucătorilor.');
        console.error('Eroare fetchPlayers:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPlayers();
  }, []);

  // Filtrăm jucătorii pe baza valorii din search bar
  useEffect(() => {
    const filtered = players.filter(player =>
      player.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
    setFilteredPlayers(filtered);
  }, [searchTerm, players]);

  // Grupăm jucătorii filtrați pe categorii
  const goalkeepers = filteredPlayers.filter(player => player.playerId?.position === 'Goalkeeper');
  const defenders = filteredPlayers.filter(player => player.playerId?.position === 'Defender');
  const midfielders = filteredPlayers.filter(player => player.playerId?.position === 'Midfielder');
  const forwards = filteredPlayers.filter(player => player.playerId?.position === 'Forward');

  // Funcție pentru a afișa o categorie de jucători
  const renderPlayerCategory = (categoryPlayers, categoryTitle) => (
    categoryPlayers.length > 0 && (
      <div className="player-category">
        <h2>{categoryTitle}</h2>
        <div className="players-list">
          {categoryPlayers.map(player => (
            <div
              key={player._id}
              className={`player-card ${player._id === currentUserId ? 'current-user' : ''}`}
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
                  onClick={() => onPlayerClick(player)}
                  onError={(e) => {
                    e.target.src = '/path-to-placeholder-image.jpg';
                    console.log(`Eroare la încărcarea imaginii pentru ${player.name}`);
                  }}
                />
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

  // Funcție pentru a gestiona schimbarea valorii din search bar
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) return <div>Se încarcă jucătorii...</div>;
  if (error) return <div>{error}</div>;
  if (players.length === 0) return <div>Nu există jucători în lot.</div>;

  return (
    <div className="players-section">
      {/* Adăugăm search bar-ul */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Caută jucător după nume..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {/* Afișăm categoriile cu jucătorii filtrați */}
      {filteredPlayers.length === 0 && searchTerm && (
        <div className="no-results">Niciun jucător găsit pentru „{searchTerm}”.</div>
      )}
      {renderPlayerCategory(goalkeepers, 'Portari')}
      {renderPlayerCategory(defenders, 'Fundași')}
      {renderPlayerCategory(midfielders, 'Mijlocași')}
      {renderPlayerCategory(forwards, 'Atacanți')}
    </div>
  );
};

export default PlayersSection;