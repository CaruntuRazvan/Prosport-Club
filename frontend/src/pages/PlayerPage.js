import React, { useState, useEffect } from 'react';
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
  const [playNotificationSound, setPlayNotificationSound] = useState(() => {
    return JSON.parse(localStorage.getItem(`playNotificationSound_${userId}`)) || false;
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const role = 'player';

  useEffect(() => {
    const loadPlayerInfo = async () => {
      if (!userId || !role) {
        console.error('No userId or role provided!');
        return;
      }

      try {
        const playerData = await fetchCurrentUser(userId, role);
        console.log('Data received from fetchCurrentUser for player:', playerData);
        setPlayerInfo(playerData);
      } catch (error) {
        console.error('Error loading player data:', error);
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMenuItemClick = (section) => {
    setActiveSection(section);
    
    // Auto-close sidebar on mobile when menu item is clicked
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };
  
  // Add this useEffect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Auto-open sidebar on desktop, auto-close on mobile
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
  
    // Set initial state based on screen size
    handleResize();
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="player-container">
      {/* Sidebar Navigation */}
      <nav className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <img src="/images/logo.png" alt="Team Logo" className="team-logo" draggable="false" />
        {playerInfo && (
          <div className="player-profile">
            <p><strong>User:</strong> {playerInfo.name}</p>
            <p style={{ fontSize: '11px',  whiteSpace: 'nowrap',overflow: 'hidden'}}><strong>Email:</strong> {playerInfo.email}</p>
          </div>
        )}
        <ul>
          <li
            className={activeSection === 'team' ? 'active' : ''}
            onClick={() => handleMenuItemClick('team')}
          >
            About Team
          </li>
          <li
            className={activeSection === 'profile' ? 'active' : ''}
            onClick={() => handleMenuItemClick('profile')}
          >
            My Profile
          </li>
          <li
            className={activeSection === 'players' ? 'active' : ''}
            onClick={() => handleMenuItemClick('players')}
          >
            Players
          </li>
          <li
            className={activeSection === 'staff' ? 'active' : ''}
            onClick={() => setActiveSection('staff')}
          >
            Staff
          </li>
          <li
            className={activeSection === 'calendar' ? 'active' : ''}
            onClick={() => handleMenuItemClick('calendar')}
          >
            Calendar
          </li>
          <li
            className={activeSection === 'polls' ? 'active' : ''}
            onClick={() => handleMenuItemClick('polls')}
          >
            Polls
          </li>
          <li
            className={activeSection === 'fines' ? 'active' : ''}
            onClick={() => handleMenuItemClick('fines')}
          >
            Fines
          </li>
          <li
            className={activeSection === 'journal' ? 'active' : ''}
            onClick={() => handleMenuItemClick('journal')}
          >
            Journal
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <h1>Player Dashboard</h1>
          <div className="header-actions">
            <NotificationsDropdown
              userId={userId}
              setActiveSection={setActiveSection}
              playNotificationSound={playNotificationSound} // Pass the setting to NotificationsDropdown
            />
            <SettingsComponent
              userId={userId}
              eventColor={eventColor}
              onColorChange={handleColorChange}
            />
            <LogoutComponent handleLogout={handleLogout} />
          </div>
        </header>

        <div className="section-wrapper" key={activeSection}>
          {/* My Profile Section */}
          {activeSection === 'profile' && playerInfo && (
            <section className="profile-section section">
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {playerInfo.playerId?.image ? (
                      <img
                        src={`${process.env.REACT_APP_URL}${playerInfo.playerId.image}`}
                        alt="Profile"
                        className="profile-image"
                        draggable="false"
                      />
                    ) : (
                      <span>{playerInfo.name.split(' ').map(word => word.charAt(0).toUpperCase()).join('')}</span>
                    )}
                  </div>
                  <h3 className="profile-name">{playerInfo.playerId?.firstName} {playerInfo.playerId?.lastName}</h3>
                  <span className="profile-role">Player</span>
                </div>

                <div className="profile-details">
                  <h4>Personal Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">First Name:</span>
                      <span className="info-value">{playerInfo.playerId?.firstName}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Last Name:</span>
                      <span className="info-value">{playerInfo.playerId?.lastName}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Age:</span>
                      <span className="info-value">{calculateAge(playerInfo.playerId?.dateOfBirth)} years</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Nationality:</span>
                      <span className="info-value">{playerInfo.playerId?.nationality}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Height:</span>
                      <span className="info-value">{playerInfo.playerId?.height} cm</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Weight:</span>
                      <span className="info-value">{playerInfo.playerId?.weight} kg</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{playerInfo.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Position:</span>
                      <span className="info-value">
                        {playerInfo.playerId?.position === 'Goalkeeper' ? 'Goalkeeper' :
                        playerInfo.playerId?.position === 'Defender' ? 'Defender' :
                        playerInfo.playerId?.position === 'Midfielder' ? 'Midfielder' :
                        playerInfo.playerId?.position === 'Forward' ? 'Forward' :
                        playerInfo.playerId?.position || 'N/A'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Shirt Number:</span>
                      <span className="info-value">{playerInfo.playerId?.shirtNumber || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone Number:</span>
                      <span className="info-value">{playerInfo.playerId?.phoneNumber || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Preferred Foot:</span>
                      <span className="info-value">
                        {playerInfo.playerId?.preferredFoot === 'right' ? 'Right' :
                        playerInfo.playerId?.preferredFoot === 'left' ? 'Left' :
                        playerInfo.playerId?.preferredFoot === 'both' ? 'Both' :
                        playerInfo.playerId?.preferredFoot || 'N/A'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Status:</span>
                      <span className="info-value">
                        {playerInfo.playerId?.status === 'notInjured' ? 'Not Injured' :
                        playerInfo.playerId?.status === 'recovering' ? 'Recovering' :
                        playerInfo.playerId?.status === 'injured' ? 'Injured' :
                        playerInfo.playerId?.status || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {playerInfo.playerId?.history && playerInfo.playerId.history.length > 0 && (
                    <div className="profile-section">
                      <h4>Club History</h4>
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

          {activeSection === 'team' && (
            <section className="team-section section">
              <AboutTeam userRole={role}/>
            </section>
          )}

          {/* Players Section */}
          {activeSection === 'players' && (
            <section className="players-section section">
              <PlayersSection
                onPlayerClick={handleOpenProfile}
                currentUserId={userId}
              />
            </section>
          )}
          
          {activeSection === 'staff' && (
            <section className="staff-section section">
              <StaffSection
                onStaffClick={handleOpenProfile}
                currentUserId={userId}
              />
            </section>
          )}

          {/* Calendar Section */}
          {activeSection === 'calendar' && (
            <section className="calendar-section section">
              <EventCalendar userId={userId} eventColor={eventColor} />
            </section>
          )}

          {/* Polls Section */}
          {activeSection === 'polls' && (
            <section className="polls-section section">
              <PollsList userId={userId} userRole={role} />
            </section>
          )}  

          {activeSection === 'fines' && (
            <section className="fines-section section">
              <FineList userId={userId} userRole={role} setActiveSection={setActiveSection}/>
            </section>
          )}
          
          {/* Journal Section */}
          {activeSection === 'journal' && (
            <section className="journal-section section">
              <JournalSection userId={userId} />
            </section>
          )}
        </div>
        
        {/* Modal for selected player's profile */}
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