// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isTokenExpired } from './utils/api';
import LoginForm from './components/auth/LoginForm';
import AdminPage from './pages/AdminPage';
import PlayerPage from './pages/PlayerPage';
import ManagerPage from './pages/ManagerPage';
import StaffPage from './pages/StaffPage';
import ScrollToTopButton from './components/shared/ScrollToTopButton';
import { ConfirmProvider } from './context/ConfirmContext';
import { useConfirm } from './context/ConfirmContext';

// Subcomponent containing the application logic
const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toastKey, setToastKey] = useState(Date.now());
  const [isInitialLoad, setIsInitialLoad] = useState(true); // New flag for initial load
  const navigate = useNavigate();
  const confirm = useConfirm();

  const checkAuth = (isPeriodicCheck = false) => {
    if (showLogoutModal) return;

    const storedUser = localStorage.getItem('user');
    const storedIsAuthenticated = localStorage.getItem('isAuthenticated');
    const token = localStorage.getItem('token');

    if (token && isTokenExpired(token)) {
      if (isPeriodicCheck && isAuthenticated) {
        // Show modal only during periodic checks for authenticated users
        confirm('Your session has expired. Please log in again.', () => {
          handleLogout();
          navigate('/login');
        });
        setShowLogoutModal(true);
      } else {
        // On initial load or if not authenticated, silently log out
        handleLogout();
        navigate('/login');
      }
      return;
    }

    if (storedUser && storedIsAuthenticated === 'true') {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserInfo(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserInfo(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserInfo(null);
    }
  };

  useEffect(() => {
    checkAuth(false); // Initial load check
    setIsLoading(false);
    setIsInitialLoad(false); // Mark initial load complete

    const interval = setInterval(() => {
      checkAuth(true); // Periodic check
    }, 3600000); // Check every hour

    return () => {
      clearInterval(interval);
    };
  }, [showLogoutModal]);

  useEffect(() => {
    if (userInfo) {
      console.log('AppContent - userInfo updated:', userInfo);
    }
  }, [userInfo]);

  const handleLogout = () => {
    console.log('AppContent - handleLogout called.');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserInfo(null);
    setShowLogoutModal(false);
    toast.dismiss();
    setToastKey(Date.now());
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <ToastContainer
        key={toastKey}
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
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={<LoginForm setIsAuthenticated={setIsAuthenticated} setUserInfo={setUserInfo} />}
        />
        <Route
          path="/admin/:id"
          element={
            isAuthenticated && userInfo?.role === 'admin' ? (
              <>
                {console.log('AppContent - userInfo in admin route:', userInfo)}
                <AdminPage userId={userInfo.id} handleLogout={handleLogout} />
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/player/:id"
          element={
            isAuthenticated && userInfo?.role === 'player' ? (
              <PlayerPage userId={userInfo.id} handleLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/manager/:id"
          element={
            isAuthenticated && userInfo?.role === 'manager' ? (
              <ManagerPage userId={userInfo.id} handleLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/staff/:id"
          element={
            isAuthenticated && userInfo?.role === 'staff' ? (
              <StaffPage userId={userInfo.id} handleLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
      <ScrollToTopButton />
    </>
  );
};

// Main App component
const App = () => {
  return (
    <Router>
      <ConfirmProvider>
        <AppContent />
      </ConfirmProvider>
    </Router>
  );
};

export default App;