import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchUsers, addUser, fetchCurrentUser, deleteUser, editUser } from '../services/userService';
import UserForm from '../components/users/UserForm';
import UserList from '../components/users/UserList';
import EditUserForm from '../components/users/EditUserForm';
import UserProfile from '../components/users/UserProfile';
import AboutTeam from '../components/shared/AboutTeam';
import AdminCharts from '../components/admin/AdminCharts';
import AdminResetSection from '../components/admin/AdminResetSection';
import { useSearchParams } from 'react-router-dom';
import '../styles/pages/AdminPage.css';
import '../styles/shared/GlobalStyles.css';

const AdminPage = ({ userId, handleLogout }) => {
  const [users, setUsers] = useState([]);
  const [adminInfo, setAdminInfo] = useState(null);
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('admin');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle scroll lock when modals are open
  useEffect(() => {
    const isAnyModalOpen = isAddingUser || editingUser || selectedUser;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden'; // Prevent scrolling on the main page
    } else {
      document.body.style.overflow = 'auto'; // Restore scrolling
    }

    return () => {
      document.body.style.overflow = 'auto'; // Cleanup on unmount
    };
  }, [isAddingUser, editingUser, selectedUser]);

  // Handle Esc key to close modals
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isAddingUser) setIsAddingUser(false);
        if (editingUser) setEditingUser(null);
        if (selectedUser) setSelectedUser(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown); // Cleanup on unmount
    };
  }, [isAddingUser, editingUser, selectedUser]);

  // Load initial data
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        toast.error('Eroare la preluarea utilizatorilor: ' + err.message, {
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

    const loadAdminInfo = async () => {
      if (!userId) {
        console.error('No userId provided!');
        return;
      }
      try {
        const adminData = await fetchCurrentUser(userId, 'admin');
        setAdminInfo(adminData);
      } catch (error) {
        toast.error('Eroare la încărcarea datelor admin: ' + error.message, {
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

    loadUsers();
    loadAdminInfo();
  }, [userId]);

  // Reset isAddingUser when entering the "Formulare" section
  useEffect(() => {
    if (activeSection === 'add-user') {
      setIsAddingUser(false);
    }
  }, [activeSection]);

  useEffect(() => {
    const sectionFromUrl = searchParams.get("section");
    if (sectionFromUrl) {
      setActiveSection(sectionFromUrl);
    }
  }, [searchParams]);

  // User management functions
  const handleAddUser = async (userData) => {
    try {
      await addUser(userData);
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
      setIsAddingUser(false);
      setActiveSection('users');
      toast.success('Utilizator adăugat cu succes!', {
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
    } catch (err) {
      toast.error('Eroare la adăugarea utilizatorului: ' + err.message, {
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

  const handleViewUser = (user) => {
    setSelectedUser(user);
  };

  const handleDelete = async (email) => {
    try {
      const message = await deleteUser(email);
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
      toast.success(message, {
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
    } catch (error) {
      toast.error('Eroare la ștergerea utilizatorului: ' + error.message, {
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

  const handleEditUser = async (userId, userData) => {
    try {
      await editUser(userId, userData);
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
      if (selectedUser && selectedUser._id === userId) {
        const updatedUser = updatedUsers.find(user => user._id === userId);
        setSelectedUser(updatedUser);
      }
      setEditingUser(null);
      toast.success('Utilizator editat cu succes!', {
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
    } catch (err) {
      toast.error('Eroare la editarea utilizatorului: ' + err.message, {
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

  // Filter users
  const filteredUsers = users
    .filter(user => user.role === activeCategory)
    .filter(user => user.name.toLowerCase().includes(searchTerm.trim().toLowerCase()));

  // Statistics
  const totalUsers = users.length;
  const totalAdmins = users.filter(user => user.role === 'admin').length;
  const totalPlayers = users.filter(user => user.role === 'player').length;
  const totalManagers = users.filter(user => user.role === 'manager').length;
  const totalStaff = users.filter(user => user.role === 'staff').length;

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const newPlayersLastMonth = users.filter(
    user => user.role === 'player' && new Date(user.createdAt) > oneMonthAgo
  ).length;

  const players = users.filter(user => user.role === 'player');
  const averageAge = players.length > 0
    ? players.reduce((sum, player) => {
        const birthDate = new Date(player.playerId?.dateOfBirth);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        return sum + age;
      }, 0) / players.length
    : 0;

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || 
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const nationalities = players.reduce((acc, player) => {
    const nat = player.playerId?.nationality || 'Necunoscut';
    acc[nat] = (acc[nat] || 0) + 1;
    return acc;
  }, {});

  // Modified logout with confirmation
  const handleLogoutWithConfirm = () => {
    const confirmLogout = window.confirm('Ești sigur că vrei să te deconectezi?');
    if (confirmLogout) {
      handleLogout();
    }
  };

  return (
    <div className="admin-container">
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
        <img src="/images/logo.png" alt="Team Logo" className="team-logo" loading="lazy" draggable="false" decoding="async"/>
        {adminInfo && (
          <div className="admin-profile">
            <p><strong>User:</strong> {adminInfo.name}</p>
            <p><strong>Email:</strong> {adminInfo.email}</p>
          </div>
        )}
        <ul>
          <li className={activeSection === 'dashboard' ? 'active' : ''} onClick={() => setActiveSection('dashboard')}>
            Dashboard
          </li>
          <li className={activeSection === 'team' ? 'active' : ''} onClick={() => setActiveSection('team')}>
            Despre Echipa
          </li>
          <li className={activeSection === 'users' ? 'active' : ''} onClick={() => setActiveSection('users')}>
            Utilizatori
          </li>
          <li className={activeSection === 'stats' ? 'active' : ''} onClick={() => setActiveSection('stats')}>
            Statistici
          </li>
          <li className={activeSection === 'reset' ? 'active' : ''} onClick={() => setActiveSection('reset')}>
            Reset
          </li>
        </ul>
      </nav>

      <div className="main-content">
        <header className="header">
          <h1>Admin Dashboard</h1>
          <button onClick={handleLogoutWithConfirm} className="logout-btn">
            <span className="logout-text">Logout</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-box-arrow-right"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"
              />
              <path
                fillRule="evenodd"
                d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
              />
            </svg>
          </button>
        </header>

        {activeSection === 'team' && <AboutTeam userRole={adminInfo?.role || 'admin'} />}
        {activeSection === 'dashboard' && (
          <section className="dashboard-section">
            <h2>Bine ai venit, {adminInfo?.name}!</h2>
            <p>Bine ai revenit la gestionarea clubului ProSport!</p>
          </section>
        )}

        {selectedUser && (
          <UserProfile user={selectedUser} onClose={() => setSelectedUser(null)} calculateAge={calculateAge} />
        )}

        {activeSection === 'users' && (
          <section className="users-section">
            <h3>Lista utilizatori</h3>
            <div className="user-controls">
              <div className="user-filter-search">
                <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} className="filter-dropdown">
                  <option value="admin">Admini</option>
                  <option value="player">Jucători</option>
                  <option value="manager">Manageri</option>
                  <option value="staff">Staff</option>
                </select>
                <input
                  type="text"
                  placeholder="Caută utilizator după nume..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-bar"
                />
              </div>
              <button className="add-user-btn" onClick={() => setIsAddingUser(true)}>
                <span className="add-icon">+</span> Adaugă utilizator
              </button>
            </div>
            <UserList
              users={filteredUsers}
              onDeleteUser={handleDelete}
              onViewUser={handleViewUser}
              onEditUser={(user) => setEditingUser(user)}
            />
            {isAddingUser && (
              <UserForm onAddUser={handleAddUser} onClose={() => setIsAddingUser(false)} />
            )}
            {editingUser && (
              <EditUserForm
                user={editingUser}
                onEditUser={handleEditUser}
                onClose={() => setEditingUser(null)}
              />
            )}
          </section>
        )}

        {activeSection === 'stats' && (
          <section className="stats-section">
            <div className="stats-grid">
              <div className="stats-card">
                <h4>Total utilizatori</h4>
                <p>{totalUsers}</p>
              </div>
              <div className="stats-card">
                <h4>Jucători noi în ultima lună</h4>
                <p>{newPlayersLastMonth}</p>
              </div>
              <div className="stats-card">
                <h4>Vârsta medie a jucătorilor</h4>
                <p>{averageAge.toFixed(1)} ani</p>
              </div>
            </div>
            {adminInfo?.role === 'admin' && (
              <AdminCharts
                totalAdmins={totalAdmins}
                totalPlayers={totalPlayers}
                totalManagers={totalManagers}
                totalStaff={totalStaff}
                newPlayersLastMonth={newPlayersLastMonth}
                averageAge={averageAge}
                nationalities={nationalities}
              />
            )}
          </section>
        )}

        {activeSection === 'reset' && (
          <section className="reset-section">
            <AdminResetSection />
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminPage;