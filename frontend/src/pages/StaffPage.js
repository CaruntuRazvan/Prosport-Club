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
  const [playNotificationSound, setPlayNotificationSound] = useState(() => {
    return JSON.parse(localStorage.getItem(`playNotificationSound_${userId}`)) || false;
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const role = 'staff';
  
  useEffect(() => {
    const loadStaffInfo = async () => {
      if (!userId) {
        console.error('No userId provided!');
        return;
      }
      try {
        const staffData = await fetchCurrentUser(userId, role);
        console.log('Staff data:', staffData);
        setStaffInfo(staffData);
      } catch (error) {
        console.error('Error loading staff data:', error);
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
      <nav className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <img src="/images/logo.png" alt="Team Logo" className="team-logo" draggable="false"/>
        {staffInfo && (
          <div className="staff-profile">
            <p><strong>User:</strong> {staffInfo.name}</p>
            <p style={{ fontSize: '11px',  whiteSpace: 'nowrap',overflow: 'hidden'}}><strong>Email:</strong> {staffInfo.email}</p>
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
            onClick={() => handleMenuItemClick('staff')}
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
            className={activeSection === 'feedbacks' ? 'active' : ''}
            onClick={() => handleMenuItemClick('feedbacks')}
          >
            Average Feedback
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
          {staffInfo?.staffId?.role === 'Nutritionist' && (
            <li
              className={activeSection === 'nutrition' ? 'active' : ''}
              onClick={() => handleMenuItemClick('nutrition')}
            >
              Nutrition
            </li>
          )}
          {(staffInfo?.staffId?.role === 'Physiotherapist' || staffInfo?.staffId?.role === 'Fitness Coach') && (
            <li
              className={activeSection === 'injuries' ? 'active' : ''}
              onClick={() => handleMenuItemClick('injuries')}
            >
              Injuries
            </li>
          )}
        </ul>
      </nav>

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
          <h1>Staff Dashboard</h1>
          <div className="header-actions">
            <RequestDropdown userId={userId} userRole={staffInfo?.role || 'staff'} />
            <NotificationsDropdown userId={userId} setActiveSection={setActiveSection} playNotificationSound={playNotificationSound}/>
            <SettingsComponent userId={userId} eventColor={eventColor} onColorChange={handleColorChange} />
            <LogoutComponent handleLogout={handleLogout} />
          </div>
        </header>

        <div className="section-wrapper" key={activeSection}>
          {activeSection === 'profile' && staffInfo && (
            <section className="profile-section section">
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
                  <h4>Personal Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">First Name:</span>
                      <span className="info-value">{staffInfo.staffId?.firstName}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Last Name:</span>
                      <span className="info-value">{staffInfo.staffId?.lastName}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Age:</span>
                      <span className="info-value">{calculateAge(staffInfo.staffId?.dateOfBirth)} years</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Nationality:</span>
                      <span className="info-value">{staffInfo.staffId?.nationality}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{staffInfo.email}</span>
                    </div>
                  </div>

                  {staffInfo.staffId?.history && staffInfo.staffId.history.length > 0 && (
                    <div className="profile-section">
                      <h4>Club History</h4>
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

          {activeSection === 'team' && (
            <section className="team-section section">
              <AboutTeam userRole={role}/>
            </section>
          )}

          {activeSection === 'players' && (
            <section className="players-section section">
              <PlayersSection onPlayerClick={handleOpenProfile} />
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

          {activeSection === 'nutrition' && staffInfo?.staffId?.role === 'Nutritionist' && (
            <section className="nutrition-section section">
              <PlayerNutritionList calculateAge={calculateAge} userRole={role}/>
            </section>
          )}

          {activeSection === 'injuries' && (staffInfo?.staffId?.role === 'Physiotherapist' || staffInfo?.staffId?.role === 'Fitness Coach') && (
            <section className="injuries-section section">
              <InjuredPlayersList userRole={role} />
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

export default StaffPage;