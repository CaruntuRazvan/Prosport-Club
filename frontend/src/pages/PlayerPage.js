import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchCurrentUser } from '../services/userService';
import AboutTeam from '../components/shared/AboutTeam';
import PlayersSection from '../components/shared/PlayersSection';
import StaffSection from '../components/shared/StaffSection';
import EventCalendar from '../components/calendar/EventCalendar';
import UserProfile from '../components/users/UserProfile';
import PollsList from '../components/polls/PollsList';
import NotificationsDropdown from '../components/notifications/NotificationsDropdown';
import JournalSection from '../components/shared/JournalSection';
import FineList from '../components/fines/FineList'; 
import SettingsComponent from '../components/shared/SettingsComponent';
import LogoutComponent from '../components/auth/LogoutComponent';
import '../styles/pages/PlayerPage.css';
import '../styles/shared/GlobalStyles.css';

const PlayerPage = ({ userId, handleLogout }) => {
  const [playerInfo, setPlayerInfo] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [searchParams] = useSearchParams();
  const [eventColor, setEventColor] = useState(() => {
    return localStorage.getItem(`eventColor_${userId}`) || '#3788d8';
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const role = 'player';

  useEffect(() => {
    const loadPlayerInfo = async () => {
      if (!userId || !role) {
        console.error('No userId or role provided!');
        return;
      }

      try {
        const playerData = await fetchCurrentUser(userId, role);
        console.log('Date primite de la fetchCurrentUser pentru player:', playerData);
        setPlayerInfo(playerData);
      } catch (error) {
        console.error('Eroare la încărcarea datelor player:', error);
      }
    };

    loadPlayerInfo();
  }, [userId, role]);

  
  useEffect(() => {
  const sectionFromUrl = searchParams.get("section");
  if (sectionFromUrl) {
    setActiveSection(sectionFromUrl);
  }
  }, [searchParams]);
  
  const calculateAge = (dateOfBirth) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleColorChange = (color) => {
    setEventColor(color);
  };

  const handleOpenProfile = (user) => {
    setSelectedUser(user);
  };

  const handleCloseProfile = () => {
    setSelectedUser(null);
  };

  return (
    <div className="player-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <img src="/images/logo.png" alt="Team Logo" className="team-logo" draggable='false' />
        {playerInfo && (
          <div className="player-profile">
            <p><strong>User:</strong> {playerInfo.name}</p>
            <p><strong>Email:</strong> {playerInfo.email}</p>
          </div>
        )}
        <ul>
          <li
            className={activeSection === 'team' ? 'active' : ''}
            onClick={() => setActiveSection('team')}
          >
            Despre Echipa
          </li>
          <li
            className={activeSection === 'profile' ? 'active' : ''}
            onClick={() => setActiveSection('profile')}
          >
            Profilul Meu
          </li>
          <li
            className={activeSection === 'players' ? 'active' : ''}
            onClick={() => setActiveSection('players')}
          >
            Jucatori
          </li>
          <li
            className={activeSection === 'staff' ? 'active' : ''}
            onClick={() => setActiveSection('staff')}
          >
            Staff
          </li>
          <li
            className={activeSection === 'calendar' ? 'active' : ''}
            onClick={() => setActiveSection('calendar')}
          >
            Calendar
          </li>
          <li
            className={activeSection === 'polls' ? 'active' : ''}
            onClick={() => setActiveSection('polls')}
          >
            Sondaje
          </li>
          <li
            className={activeSection === 'fines' ? 'active' : ''}
            onClick={() => setActiveSection('fines')}
          >
            Fines
          </li>
           <li
            className={activeSection === 'journal' ? 'active' : ''}
            onClick={() => setActiveSection('journal')}
          >
            Jurnal
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h1>Player Dashboard</h1>
          <div className="header-actions">
            <NotificationsDropdown userId={userId} setActiveSection={setActiveSection} />
            <SettingsComponent userId={userId} eventColor={eventColor} onColorChange={handleColorChange} />
            <LogoutComponent handleLogout={handleLogout} />
          </div>
        </header>

        {/* Secțiunea Profilul Meu */}
        {activeSection === 'profile' && playerInfo && (
          <section className="profile-section">
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  {playerInfo.playerId?.image ? (
                    <img src={`${process.env.REACT_APP_URL}${playerInfo.playerId.image}`} alt="Profile" className="profile-image" draggable="false"/>
                  ) : (
                    <span>{playerInfo.name.split(' ').map(word => word.charAt(0).toUpperCase()).join('')}</span>
                  )}
                </div>
                <h3 className="profile-name">{playerInfo.playerId?.firstName} {playerInfo.playerId?.lastName}</h3>
                <span className="profile-role">Jucător</span>
              </div>

              <div className="profile-details">
                <h4>Informații personale</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Prenume:</span>
                    <span className="info-value">{playerInfo.playerId?.firstName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Nume:</span>
                    <span className="info-value">{playerInfo.playerId?.lastName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Vârsta:</span>
                    <span className="info-value">{calculateAge(playerInfo.playerId?.dateOfBirth)} ani</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Naționalitate:</span>
                    <span className="info-value">{playerInfo.playerId?.nationality}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Înălțime:</span>
                    <span className="info-value">{playerInfo.playerId?.height} cm</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Greutate:</span>
                    <span className="info-value">{playerInfo.playerId?.weight} kg</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{playerInfo.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Poziție:</span>
                    <span className="info-value">
                      {playerInfo.playerId?.position === 'Goalkeeper' ? 'Portar' :
                      playerInfo.playerId?.position === 'Defender' ? 'Fundaș' :
                      playerInfo.playerId?.position === 'Midfielder' ? 'Mijlocaș' :
                      playerInfo.playerId?.position === 'Forward' ? 'Atacant' :
                      playerInfo.playerId?.position || 'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Număr tricou:</span>
                    <span className="info-value">{playerInfo.playerId?.shirtNumber || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Număr de telefon:</span>
                    <span className="info-value">{playerInfo.playerId?.phoneNumber || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Picior preferat:</span>
                    <span className="info-value">
                      {playerInfo.playerId?.preferredFoot === 'right' ? 'Drept' :
                      playerInfo.playerId?.preferredFoot === 'left' ? 'Stâng' :
                      playerInfo.playerId?.preferredFoot === 'both' ? 'Ambele' :
                      playerInfo.playerId?.preferredFoot || 'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Stare:</span>
                    <span className="info-value">
                      {playerInfo.playerId?.status === 'notInjured' ? 'Nu este accidentat' :
                      playerInfo.playerId?.status === 'recovering' ? 'În recuperare' :
                      playerInfo.playerId?.status === 'injured' ? 'Accidentat' :
                      playerInfo.playerId?.status || 'N/A'}
                    </span>
                  </div>
                </div>

                {playerInfo.playerId?.history && playerInfo.playerId.history.length > 0 && (
                  <div className="profile-section">
                    <h4>Istoric cluburi</h4>
                    <ul className="history-list">
                      {playerInfo.playerId.history.map((entry, index) => (
                        <li key={index}>
                          {entry.club} ({entry.startYear} - {entry.endYear})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeSection === 'team' && <AboutTeam userRole={role}/>}

        {/* Secțiunea Jucatori */}
        {activeSection === 'players' && (
          <PlayersSection
            onPlayerClick={handleOpenProfile}
            currentUserId={userId}
          />
        )}
        
        {activeSection === 'staff' && (
          <StaffSection
            onStaffClick={handleOpenProfile}
            currentUserId={userId}
          />
        )}

        {/* Secțiunea Calendar */}
        {activeSection === 'calendar' && (
          <section className="calendar-section">
            <EventCalendar userId={userId} eventColor={eventColor} />
          </section>
        )}

        {/* Secțiunea Sondaje */}
       {activeSection === 'polls' && (
        <section className="polls-section">
          <PollsList userId={userId} userRole={role} />
        </section>
        )}  

         {activeSection === 'fines' && (
        <section className="fines-section">
          <FineList userId={userId} userRole={role} />
        </section>
        )}
        
          {/* Secțiunea Penalizări */}
        {activeSection === 'journal' && <JournalSection userId={userId} />}
        
        {/* Modal pentru profilul jucătorului selectat */}
        {selectedUser && (
          <UserProfile
            user={selectedUser}
            onClose={handleCloseProfile}
            calculateAge={calculateAge}
          />
        )}
      </div>
    </div>
  );
};

export default PlayerPage;