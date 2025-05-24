import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchCurrentUser } from '../services/userService';
import AboutTeam from '../components/shared/AboutTeam';
import PlayersSection from '../components/shared/PlayersSection';
import StaffSection from '../components/shared/StaffSection';
import UserProfile from '../components/users/UserProfile';
import EventCalendar from '../components/calendar/EventCalendar';
import FeedbackSummarySection from '../components/feedbacks/FeedbackSummarySection';
import PollsList from '../components/polls/PollsList';
import JournalSection from '../components/shared/JournalSection';
import FineList from '../components/fines/FineList';
import RequestDropdown from '../components/shared/RequestDropdown';
import NotificationsDropdown from '../components/notifications/NotificationsDropdown';
import SettingsComponent from '../components/shared/SettingsComponent';
import LogoutComponent from '../components/auth/LogoutComponent';
import PlayerNutritionList from '../components/staff/PlayerNutritionList';
import InjuredPlayersList from '../components/staff/InjuredPlayersList';
//import '../styles/StaffPage.css';
import '../styles/shared/GlobalStyles.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StaffPage = ({ userId, handleLogout }) => {
  const [staffInfo, setStaffInfo] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [searchParams] = useSearchParams();
  const [eventColor, setEventColor] = useState(() => {
    return localStorage.getItem(`eventColor_${userId}`) || '#3788d8';
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const role = 'staff';

  useEffect(() => {
    const loadStaffInfo = async () => {
      if (!userId) {
        console.error('No userId provided!');
        return;
      }
      try {
        const staffData = await fetchCurrentUser(userId, role);
        console.log('Date staff:', staffData);
        setStaffInfo(staffData);
      } catch (error) {
        console.error('Eroare la încărcarea datelor staff-ului:', error);
      }
    };

    loadStaffInfo();
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
    <div className="staff-container">
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
        {staffInfo && (
          <div className="staff-profile">
            <p><strong>User:</strong> {staffInfo.name}</p>
            <p><strong>Email:</strong> {staffInfo.email}</p>
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
            Penalizări
          </li>
          <li
            className={activeSection === 'journal' ? 'active' : ''}
            onClick={() => setActiveSection('journal')}
          >
            Jurnal
          </li>
          {staffInfo?.staffId?.role === 'Nutritionist' && (
            <li
              className={activeSection === 'nutrition' ? 'active' : ''}
              onClick={() => setActiveSection('nutrition')}
            >
              Nutriție
            </li>
          )}
          {(staffInfo?.staffId?.role === 'Physiotherapist' || staffInfo?.staffId?.role === 'Fitness Coach') && (
            <li
              className={activeSection === 'injuries' ? 'active' : ''}
              onClick={() => setActiveSection('injuries')}
            >
              Accidentări
            </li>
          )}
        </ul>
      </nav>

      <div className="main-content">
        <header className="header">
          <h1>Staff Dashboard</h1>
          <div className="header-actions">
            <RequestDropdown userId={userId} userRole={staffInfo?.role || 'staff'} />
            <NotificationsDropdown userId={userId} setActiveSection={setActiveSection} />
            <SettingsComponent userId={userId} eventColor={eventColor} onColorChange={handleColorChange} />
            <LogoutComponent handleLogout={handleLogout} />
          </div>
        </header>

        {activeSection === 'profile' && staffInfo && (
          <section className="profile-section">
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  {staffInfo.staffId?.image ? (
                    <img src={`${process.env.REACT_APP_URL}${staffInfo.staffId.image}`} alt="Profile" className="profile-image" loading="lazy" draggable="false"/>
                  ) : (
                    <span>{staffInfo.name.split(' ').map(word => word.charAt(0).toUpperCase()).join('')}</span>
                  )}
                </div>
                <h3 className="profile-name">{staffInfo.staffId?.firstName} {staffInfo.staffId?.lastName}</h3>
                <span className="profile-role">Staff</span>
              </div>

              <div className="profile-details">
                <h4>Informații personale</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Prenume:</span>
                    <span className="info-value">{staffInfo.staffId?.firstName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Nume:</span>
                    <span className="info-value">{staffInfo.staffId?.lastName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Vârsta:</span>
                    <span className="info-value">{calculateAge(staffInfo.staffId?.dateOfBirth)} ani</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Naționalitate:</span>
                    <span className="info-value">{staffInfo.staffId?.nationality}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{staffInfo.email}</span>
                  </div>
                </div>

                {staffInfo.staffId?.history && staffInfo.staffId.history.length > 0 && (
                  <div className="profile-section">
                    <h4>Istoric cluburi</h4>
                    <ul className="history-list">
                      {staffInfo.staffId.history.map((entry, index) => (
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

        {activeSection === 'players' && (
          <PlayersSection onPlayerClick={handleOpenProfile} />
        )}

        {activeSection === 'staff' && (
          <StaffSection
            onStaffClick={handleOpenProfile}
            currentUserId={userId}
          />
        )}

        {activeSection === 'calendar' && (
          <section className="calendar-section">
            <EventCalendar userId={userId} eventColor={eventColor} />
          </section>
        )}

        {activeSection === 'feedbacks' && (
          <section className="feedbacks-section">
            <FeedbackSummarySection creatorId={userId} />
          </section>
        )}

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

        {activeSection === 'journal' && <JournalSection userId={userId} />}

        {activeSection === 'nutrition' && staffInfo?.staffId?.role === 'Nutritionist' && (
          <PlayerNutritionList calculateAge={calculateAge} userRole={role}/>
        )}

        {activeSection === 'injuries' && (staffInfo?.staffId?.role === 'Physiotherapist' || staffInfo?.staffId?.role === 'Fitness Coach') && (
          <InjuredPlayersList userRole={role} />
        )}

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

export default StaffPage;