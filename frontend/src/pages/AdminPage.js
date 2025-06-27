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
import LogoutComponent from '../components/auth/LogoutComponent';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
        toast.error('Error fetching users: ' + err.message, {
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
        toast.error('Error loading admin data: ' + error.message, {
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
      toast.success('User added successfully!', {
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
      toast.error('Error adding user: ' + err.message, {
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
      toast.error('Error deleting user: ' + error.message, {
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
      toast.success('User updated successfully!', {
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
      toast.error('Error updating user: ' + err.message, {
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
    const nat = player.playerId?.nationality || 'Unknown';
    acc[nat] = (acc[nat] || 0) + 1;
    return acc;
  }, {});

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
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
      <nav className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <img src="/images/logo.png" alt="Team Logo" className="team-logo" loading="lazy" draggable="false" decoding="async"/>
        {adminInfo && (
          <div className="admin-profile">
            <p><strong>User:</strong> {adminInfo.name}</p>
            <p><strong>Email:</strong> {adminInfo.email}</p>
          </div>
        )}
        <ul>
          <li className={activeSection === 'dashboard' ? 'active' : ''} onClick={() => handleMenuItemClick('dashboard')}>
            Dashboard
          </li>
          <li className={activeSection === 'team' ? 'active' : ''} onClick={() => handleMenuItemClick('team')}>
            About Team
          </li>
          <li className={activeSection === 'users' ? 'active' : ''} onClick={() => handleMenuItemClick('users')}>
            Users
          </li>
          <li className={activeSection === 'stats' ? 'active' : ''} onClick={() => handleMenuItemClick('stats')}>
            Statistics
          </li>
          <li className={activeSection === 'reset' ? 'active' : ''} onClick={() => handleMenuItemClick('reset')}>
            Reset
          </li>
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
          <h1>Admin Dashboard</h1>
          <LogoutComponent handleLogout={handleLogout} />
        </header>

        <div className="section-wrapper" key={activeSection}>
          {activeSection === 'dashboard' && (
            <section className="dashboard-section section">
              <h2>
                {(() => {
                  const hour = new Date().getHours();
                  if (hour < 12) return "Good morning";
                  if (hour < 17) return "Good afternoon";
                  return "Good evening";
                })()}, {adminInfo?.name}! Ready to lead ProSport to victory? ⚽
              </h2>
              <p>Let’s make things happen—manage your team like a champion today!</p>
            </section>
          )}

          {activeSection === 'team' && (
            <section className="team-section section">
              <AboutTeam userRole={adminInfo?.role || 'admin'} />
            </section>
          )}

          {activeSection === 'users' && (
            <section className="users-section section">
              <h3>Users List</h3>
              <div className="user-controls">
                <div className="admin-user-filter-search">
                  <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} className="admin-filter-dropdown">
                    <option value="admin">Admins</option>
                    <option value="player">Players</option>
                    <option value="manager">Managers</option>
                    <option value="staff">Staff</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search user by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-users-search-bar"
                  />
                </div>
                <button className="add-user-btn" onClick={() => setIsAddingUser(true)}>
                  <span className="add-icon">+</span> Add User
                </button>
              </div>
              <UserList
                users={filteredUsers}
                onDeleteUser={handleDelete}
                onViewUser={handleViewUser}
                onEditUser={(user) => setEditingUser(user)}
                currentUserId={userId} // Pass the logged-in admin's userId
              />
            </section>
          )}
          {activeSection === 'stats' && (
            <section className="stats-section section">
              <div className="stats-grid">
                <div className="stats-card">
                  <h4>Total Users</h4>
                  <p>{totalUsers}</p>
                </div>
                <div className="stats-card">
                  <h4>New Players in the Last Month</h4>
                  <p>{newPlayersLastMonth}</p>
                </div>
                <div className="stats-card">
                  <h4>Average Age of Players</h4>
                  <p>{averageAge.toFixed(1)} years</p>
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
            <section className="reset-section section">
              <AdminResetSection />
            </section>
          )}
        </div>

        {selectedUser && (
          <UserProfile user={selectedUser} onClose={() => setSelectedUser(null)} calculateAge={calculateAge} />
        )}

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
      </div>
    </div>
  );
};

export default AdminPage;