import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../utils/api';
import { toast } from 'react-toastify';
import '../../styles/auth/LoginForm.css';

const LoginForm = ({ setIsAuthenticated, setUserInfo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [shakeInputs, setShakeInputs] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('LoginForm - Componenta s-a montat');
    setEmail('');
    setPassword('');
    setLoading(false);
    setShowPassword(false);
    toast.dismiss();

    const img = new Image();
    img.src = "/images/logo_background.png";
    img.onload = () => setImageLoaded(true);

    return () => {
      console.log('LoginForm - Componenta s-a demontat');
      toast.dismiss();
    };
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = "/images/logo_background.png";
    img.onload = () => setImageLoaded(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const data = await loginUser(email, password);
      const { token, user } = data;
      setIsAuthenticated(true);
      setUserInfo(user);

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('token', token);

      await new Promise((resolve) => {
        toast.success('Logare reușită!', {
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
          onClose: resolve,
        });
      });

      setWelcomeMessage(`Bine ai venit, ${user.name}!`);
      setShowSuccessAnimation(true);

      setTimeout(() => {
        navigate(`/${user.role}/${user.id}`);
      }, 2000);
    } catch (error) {
      const errorMessage = error.errors
        ? error.errors.map((err) => err.msg).join(', ')
        : error.message || 'Email sau parolă incorectă';

      // Declanșăm efectul de shake înainte de afișarea toast-ului
      setShakeInputs(true);

      // Afișăm toast-ul și așteptăm închiderea lui
      await new Promise((resolve) => {
        toast.error(errorMessage, {
          autoClose: 500,
          hideProgressBar: true,
          closeButton: false,
          style: {
            background: '#dc3545',
            color: '#fff',
            fontSize: '14px',
            padding: '8px 16px',
            borderRadius: '4px',
          },
          onClose: resolve,
        });
      });

      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className={`login-form ${showSuccessAnimation ? 'blur-form' : ''}`} onSubmit={handleSubmit}>
        {!imageLoaded ? (
          <div className="image-placeholder">Loading...</div>
        ) : (
          <img src="/images/logo_background.png" alt="Team Logo" className="team-logo-login" loading="lazy" draggable="false"/>
        )}
        <div className="input-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            autoFocus
            disabled={loading || showSuccessAnimation}
            className={shakeInputs ? 'shake' : ''}
            onAnimationEnd={() => setShakeInputs(false)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password:</label>
          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={loading || showSuccessAnimation}
              className={shakeInputs ? 'shake' : ''}
              onAnimationEnd={() => setShakeInputs(false)}
            />
            <button
              type="button"
              className="show-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ascunde parola' : 'Afișează parola'}
              disabled={loading || showSuccessAnimation}
            >
              <span className="eye-icon">👁️‍🗨️</span>
            </button>
          </div>
        </div>
        <button type="submit" className="login-btn" disabled={loading || showSuccessAnimation}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {showSuccessAnimation && (
        <div className="success-overlay">
          <div className="logo-ball-container">
            <img src="/images/logo_background.png" alt="Team Logo" className="success-logo" loading="lazy"/>
            <div className="impact-flash"></div>
            <div className="football-ball-trail">
              <div className="football-ball">⚽</div>
            </div>
          </div>
          <p className="welcome-message">{welcomeMessage}</p>
        </div>
      )}
    </div>
  );
};

export default LoginForm;