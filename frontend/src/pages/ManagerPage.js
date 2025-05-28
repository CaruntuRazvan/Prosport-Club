import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchCurrentUser, fetchPlayers } from '../services/userService';
import AboutTeam from '../components/shared/AboutTeam';
import PlayersSection from '../components/shared/PlayersSection';
import StaffSection from '../components/shared/StaffSection';
import UserProfile from '../components/users/UserProfile';
import EventCalendar from '../components/calendar/EventCalendar';
import { getEvents } from '../services/eventService';
import ManagerCharts from '../components/manager/ManagerCharts';
import PollsList from '../components/polls/PollsList';
import NotificationsDropdown from '../components/notifications/NotificationsDropdown';
import FeedbackSummarySection from '../components/feedbacks/FeedbackSummarySection';
import JournalSection from '../components/shared/JournalSection';
import FineList from '../components/fines/FineList';
import RequestDropdown from '../components/shared/RequestDropdown';
import SettingsComponent from '../components/shared/SettingsComponent';
import LogoutComponent from '../components/auth/LogoutComponent';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/pages/ManagerPage.css';
import '../styles/shared/GlobalStyles.css';

const ManagerPage = ({ userId, handleLogout }) => {
  const [managerInfo, setManagerInfo] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [searchParams] = useSearchParams();
  const [eventColor, setEventColor] = useState(() => {
    return localStorage.getItem(`eventColor_${userId}`) || '#3788d8';
  });
  const [playNotificationSound, setPlayNotificationSound] = useState(() => {
      return JSON.parse(localStorage.getItem(`playNotificationSound_${userId}`)) || false;
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  
  const [playersByPosition, setPlayersByPosition] = useState({});
  const [ageDistribution, setAgeDistribution] = useState({});
  const [nationalities, setNationalities] = useState({});
  const [medicalStatus, setMedicalStatus] = useState({});
  const [preferredFoot, setPreferredFoot] = useState({});
  const [averageAge, setAverageAge] = useState(0);
  const [shirtNumbers, setShirtNumbers] = useState({});
  const [averageHeightByPosition, setAverageHeightByPosition] = useState({});
  const role = 'manager';

  useEffect(() => {
    const loadManagerInfo = async () => {
      if (!userId) {
        console.error('No userId provided!');
        return;
      }
      try {
        const managerData = await fetchCurrentUser(userId, role);
        console.log('Date manager:', managerData);
        setManagerInfo(managerData);
      } catch (error) {
        console.error('Eroare la încărcarea datelor managerului:', error);
      }
    };

    loadManagerInfo();
  }, [userId, role]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventData = await getEvents(userId);
        setEvents(eventData);
      } catch (err) {
        setError('Eroare la obținerea evenimentelor.');
        console.error('Eroare la încărcarea evenimentelor:', err);
      }
    };
    loadEvents();
  }, [userId]);

  useEffect(() => {
    const sectionFromUrl = searchParams.get('section');
    if (sectionFromUrl) {
      setActiveSection(sectionFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadPlayersData = async () => {
      try {
        const players = await fetchPlayers();

        const positions = players.reduce((acc, player) => {
          const position = player.playerId?.position || 'Unknown';
          acc[position] = (acc[position] || 0) + 1;
          return acc;
        }, {});
        setPlayersByPosition(positions);

        const ageDist = { '18-22': 0, '23-27': 0, '28-32': 0, '33+': 0 };
        let totalAge = 0;
        let playerCount = 0;
        players.forEach((player) => {
          const birthDate = new Date(player.playerId?.dateOfBirth);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          totalAge += age;
          playerCount++;
          if (age >= 18 && age <= 22) ageDist['18-22']++;
          else if (age >= 23 && age <= 27) ageDist['23-27']++;
          else if (age >= 28 && age <= 32) ageDist['28-32']++;
          else if (age >= 33) ageDist['33+']++;
        });
        setAgeDistribution(ageDist);
        setAverageAge(playerCount > 0 ? totalAge / playerCount : 0);

        const natDist = players.reduce((acc, player) => {
          const nationality = player.playerId?.nationality || 'Unknown';
          acc[nationality] = (acc[nationality] || 0) + 1;
          return acc;
        }, {});
        setNationalities(natDist);

        const medStatus = players.reduce((acc, player) => {
          const status = player.playerId?.status || 'Unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, { notInjured: 0, recovering: 0, injured: 0 });
        setMedicalStatus(medStatus);

        const footDist = players.reduce((acc, player) => {
          const foot = player.playerId?.preferredFoot || 'Unknown';
          acc[foot] = (acc[foot] || 0) + 1;
          return acc;
        }, { right: 0, left: 0, both: 0 });
        setPreferredFoot(footDist);

        const shirtDist = players.reduce((acc, player) => {
          const number = player.playerId?.shirtNumber || 'Unassigned';
          acc[number] = (acc[number] || 0) + 1;
          return acc;
        }, {});
        setShirtNumbers(shirtDist);
        const heightByPosition = players.reduce((acc, player) => {
          const position = player.playerId?.position || 'Unknown';
          if (!acc[position]) {
            acc[position] = { totalHeight: 0, count: 0 };
          }
          const height = player.playerId?.height || 0;
          acc[position].totalHeight += height;
          acc[position].count += 1;
          return acc;
        }, {});
  
        const averageHeightByPosition = Object.keys(heightByPosition).reduce((acc, position) => {
          const { totalHeight, count } = heightByPosition[position];
          acc[position] = count > 0 ? (totalHeight / count).toFixed(1) : 0;
          return acc;
        }, {});

        setAverageHeightByPosition(averageHeightByPosition);
      } catch (error) {
        console.error('Eroare la preluarea datelor jucătorilor:', error);
      }
    };
    loadPlayersData();
  }, []);

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
    <div className="manager-container">
      <ToastContainer
        position="bottom-left"
        autoClose={1500}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 999999, position: 'fixed', bottom: 0, left: 0 }}
      />
      <nav className="sidebar">
        <img src="/images/logo.png" alt="Team Logo" className="team-logo" draggable="false"/>
        {managerInfo && (
          <div className="manager-profile">
            <p><strong>User:</strong> {managerInfo.name}</p>
            <p><strong>Email:</strong> {managerInfo.email}</p>
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
            className={activeSection === 'statistics' ? 'active' : ''}
            onClick={() => setActiveSection('statistics')}
          >
            Statistici
          </li>
          <li
            className={activeSection === 'feedbacks' ? 'active' : ''}
            onClick={() => setActiveSection('feedbacks')}
          >
            Feedback-uri Medie
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

      <div className="main-content">
        <header className="header">
          <h1>Manager Dashboard</h1>
          <div className="header-actions">
            <RequestDropdown userId={userId} userRole={managerInfo?.role || 'manager'} />
            <NotificationsDropdown userId={userId} setActiveSection={setActiveSection} playNotificationSound={playNotificationSound}/>
            <SettingsComponent userId={userId} eventColor={eventColor} onColorChange={handleColorChange} />
            <LogoutComponent handleLogout={handleLogout} />
          </div>
        </header>

        <div className="section-wrapper" key={activeSection}>
          {activeSection === 'profile' && managerInfo && (
            <section className="profile-section section">
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {managerInfo.managerId?.image ? (
                      <img src={`${process.env.REACT_APP_URL}${managerInfo.managerId.image}`} alt="Profile" className="profile-image" draggable="false"/>
                    ) : (
                      <span>{managerInfo.name.split(' ').map(word => word.charAt(0).toUpperCase()).join('')}</span>
                    )}
                  </div>
                  <h3 className="profile-name">{managerInfo.managerId?.firstName} {managerInfo.managerId?.lastName}</h3>
                  <span className="profile-role">Manager</span>
                </div>

                <div className="profile-details">
                  <h4>Informații personale</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Prenume:</span>
                      <span className="info-value">{managerInfo.managerId?.firstName}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Nume:</span>
                      <span className="info-value">{managerInfo.managerId?.lastName}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Vârsta:</span>
                      <span className="info-value">{calculateAge(managerInfo.managerId?.dateOfBirth)} ani</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Naționalitate:</span>
                      <span className="info-value">{managerInfo.managerId?.nationality}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{managerInfo.email}</span>
                    </div>
                  </div>

                  {managerInfo.managerId?.history && managerInfo.managerId.history.length > 0 && (
                    <div className="profile-section">
                      <h4>Istoric cluburi</h4>
                      <ul className="history-list">
                        {managerInfo.managerId.history.map((entry, index) => (
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

          {activeSection === 'players' && (
            <section className="players-section section">
              <PlayersSection
                onPlayerClick={handleOpenProfile}
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
          {activeSection === 'calendar' && (
            <section className="calendar-section section">
              <EventCalendar userId={userId} eventColor={eventColor} />
            </section>
          )}

          {activeSection === 'statistics' && (
            <section className="statistics-section section">
              <ManagerCharts
                playersByPosition={playersByPosition}
                ageDistribution={ageDistribution}
                nationalities={nationalities}
                medicalStatus={medicalStatus}
                preferredFoot={preferredFoot}
                averageAge={averageAge}
                shirtNumbers={shirtNumbers}
                averageHeightByPosition={averageHeightByPosition}
              />
            </section>
          )}
          {activeSection === 'feedbacks' && (
            <section className="feedbacks-section section">
              <FeedbackSummarySection creatorId={userId} />
            </section>
          )}

          {activeSection === 'polls' && (
            <section className="polls-section section">
              <PollsList userId={userId} userRole={role} />
            </section>
          )}
         
          {activeSection === 'fines' && (
            <section className="fines-section section">
              <FineList userId={userId} userRole={role} />
            </section>
          )}
          
          {activeSection === 'journal' && (
            <section className="journal-section section">
              <JournalSection userId={userId} />
            </section>
          )}
        </div>

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

export default ManagerPage;