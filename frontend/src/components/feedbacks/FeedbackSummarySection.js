import React, { useState, useEffect } from 'react';
import { getFeedbackSummariesByCreator } from '../../services/feedbackService';
import { fetchCurrentUser } from '../../services/userService';
import exportFeedbackSummaryToPDF from '../../services/exportFeedbackSummaryToPDF';
import '../../styles/feedbacks/FeedbackSummarySection.css';

const FeedbackSummarySection = ({ creatorId }) => {
  const [summaries, setSummaries] = useState([]);
  const [filteredSummaries, setFilteredSummaries] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]); // State pentru top 3 jucători
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const summariesData = await getFeedbackSummariesByCreator(creatorId);
        setSummaries(summariesData);
        setFilteredSummaries(summariesData);

        // Calculăm top 3 jucători după averageSatisfaction
        const sortedSummaries = [...summariesData].sort((a, b) => parseFloat(b.averageSatisfaction) - parseFloat(a.averageSatisfaction));
        setTopPlayers(sortedSummaries.slice(0, 3));

        const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
        const userRole = storedUser?.role || 'manager';
        const userData = await fetchCurrentUser(creatorId, userRole);
        setCurrentUser(userData);

        const response = await fetch("/images/logo.png");
        if (!response.ok) throw new Error('Nu s-a putut încărca logo-ul');
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        setError(err.message);
        console.error('Eroare:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [creatorId]);

  const getScoreRange = (average) => {
    if (average >= 2.5) return 'high';
    if (average >= 1.5) return 'medium';
    return 'low';
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === '') {
      setFilteredSummaries(summaries);
    } else {
      const filtered = summaries.filter(summary =>
        summary.playerName.toLowerCase().includes(term.trim().toLowerCase())
      );
      setFilteredSummaries(filtered);
    }
  };

  const handleExportToPDF = () => {
    const generatedBy = currentUser?.name || 'Utilizator necunoscut';
    const role = currentUser?.role || 'Rol necunoscut';
    exportFeedbackSummaryToPDF(filteredSummaries, generatedBy, role, logoBase64);
  };

  if (loading) return <div className="feedback-loading-message">Se încarcă mediile feedback-urilor...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="feedback-summary-section">
      {/* Secțiunea Top 3 Jucători - vizibilă doar pentru manager */}
      {currentUser?.role === 'manager' && summaries.length >= 3  && (
        <div className="top-players-section">
          <h3>🏆 Top 3</h3>
          <div className="top-players-list">
            {topPlayers.map((player, index) => (
              <div key={player.playerId} className={`top-player-card top-${index + 1}`}>
                <span className="top-player-position">#{index + 1}</span>
                <span className="top-player-name">{player.playerName}</span>
                <span className="top-player-score">
                  Media: {parseFloat(player.averageSatisfaction).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="feedback-actions">
        <div className="feedback-search-bar">
          <input
            type="text"
            placeholder="Caută jucător..."
            value={searchTerm}
            onChange={handleSearch}
            className="feedback-search-input"
          />
        </div>
        <button className="feedback-export-button" onClick={handleExportToPDF}>
          Export as PDF
        </button>
      </div>

      {summaries.length === 0 ? (
        <div className="feedback-no-data-message">
          Nu există feedback-uri disponibile momentan.
        </div>
      ) : filteredSummaries.length === 0 ? (
        <div className="feedback-no-results-message">
          Niciun jucător nu corespunde căutării tale.
        </div>
      ) : (
        <div className="feedback-summary-list">
          {filteredSummaries.map(summary => (
            <div key={summary.playerId} className="feedback-summary-card">
              <div className="feedback-summary-info">
                <span className="feedback-player-name">{summary.playerName}</span>
                <span
                  className="feedback-average-satisfaction"
                  data-score={summary.averageSatisfaction}
                  data-score-range={getScoreRange(parseFloat(summary.averageSatisfaction))}
                >
                  ({summary.feedbackCount} feedback-uri)
                </span>
                <span className="feedback-summary-text">{summary.summary}</span>
                <span className="feedback-last-updated">
                  Ultima actualizare: {new Date(summary.lastUpdated).toLocaleDateString('ro-RO')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackSummarySection;