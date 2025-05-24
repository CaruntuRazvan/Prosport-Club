// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyAuth } from '../utils/api'; // Presupunem că ai o funcție care verifică autentificarea pe server

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthenticated(false);
      setUserInfo(null);

      const storedAuth = localStorage.getItem('isAuthenticated') === 'true';
      const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

      if (storedAuth && storedUser) {
        try {
          const response = await verifyAuth(storedUser);
          if (response.success) {
            setIsAuthenticated(true);
            setUserInfo(storedUser);
            if (storedUser.role === 'admin') {
              navigate(`/admin/${storedUser.id}`);
            } else if (storedUser.role === 'player') {
              navigate(`/player/${storedUser.id}`);
            }
          } else {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('user');
            localStorage.removeItem('token'); // Dacă folosești un token
            navigate('/login');
          }
        } catch (error) {
          console.error('Eroare la verificarea autentificării:', error);
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('user');
          localStorage.removeItem('token'); // Dacă folosești un token
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate, location]);

  const logout = () => {
    setIsAuthenticated(false);
    setUserInfo(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Dacă folosești un token
    navigate('/login');
  };

  const value = { isAuthenticated, setIsAuthenticated, userInfo, setUserInfo, navigate, logout }; // Adaugă logout în context

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;