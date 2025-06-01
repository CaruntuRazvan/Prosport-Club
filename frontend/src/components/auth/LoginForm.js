import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../utils/api';
import { toast } from 'react-toastify';
import { obfuscateId } from '../../utils/obfuscateId';
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
    console.log('LoginForm - Component mounted');
    setEmail('');
    setPassword('');
    setLoading(false);
    setShowPassword(false);
    toast.dismiss();

    const img = new Image();
    img.src = "/images/logo_background.png";
    img.onload = () => setImageLoaded(true);

    return () => {
      console.log('LoginForm - Component unmounted');
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

      // Log the raw user ID
      console.log('Raw user ID from backend:', user.id);

      // Ensure the user ID is valid
      if (!user.id || !/^[0-9a-fA-F]{24}$/.test(user.id)) {
        throw new Error('Invalid user ID received from backend');
      }

      // Encode the user ID for the URL
      const encodedId = obfuscateId(user.id);
      console.log('Encoded user ID for URL:', encodedId);

      setIsAuthenticated(true);
      setUserInfo(user);

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('token', token);

      await new Promise((resolve) => {
        toast.success('Login successful!', {
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

      setWelcomeMessage(`Welcome, ${user.name}!`);
      setShowSuccessAnimation(true);

      setTimeout(() => {
        // Navigate using the encoded ID in the URL
        navigate(`/${user.role}/${encodedId}`);
      }, 2000);
    } catch (error) {
      const errorMessage = error.errors
        ? error.errors.map((err) => err.msg).join(', ')
        : error.message || 'Incorrect email or password';

      setShakeInputs(true);

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
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={loading || showSuccessAnimation}
            >
              {showPassword ? (
                // Eye with Slash (password visible)
                <svg
                  className="eye-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1e3a8a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 2l20 20" />
                  <path d="M6.71277 6.7226C3.66479 8.79573 2 12 2 12s3.63636 5.27273 10 5.27273c2.0507 0 3.8354-.5758 5.3897-1.5732" />
                  <path d="M22 12s-3.63636-5.27273-10-5.27273c-.3415 0-.6754.0185-1 .0546" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                // Eye Normal (password hidden)
                <svg
                  className="eye-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1e3a8a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3.63636-5.27273 10-5.27273 10 5.27273 10 5.27273-3.63636 5.27273-10 5.27273S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
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