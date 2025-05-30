import React, { useState, useRef, useEffect } from 'react';
import '../../styles/shared/SettingsComponent.css';

const SettingsComponent = ({ userId, eventColor, onColorChange }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playNotificationSound, setPlayNotificationSound] = useState(false);
  const settingsModalRef = useRef(null);

  const predefinedColors = [
    { name: 'Brick Red', value: '#c0392b' },
    { name: 'Golden Yellow', value: '#f1c40f' },
    { name: 'Royal Purple', value: '#8e44ad' },
    { name: 'Light Blue', value: '#3498db' },
    { name: 'Olive Green', value: '#27ae60' },
    { name: 'Coral Pink', value: '#e91e63' },
  ];

  useEffect(() => {
    const storedColor = localStorage.getItem(`eventColor_${userId}`);
    const savedPlaySound = localStorage.getItem(`playNotificationSound_${userId}`);
    
    if (!storedColor) {
      const defaultColor = '#3498db'; // Light Blue
      localStorage.setItem(`eventColor_${userId}`, defaultColor);
      onColorChange(defaultColor);
    }
    if (savedPlaySound !== null) {
      setPlayNotificationSound(JSON.parse(savedPlaySound));
    }
  }, [userId, onColorChange]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsModalRef.current && !settingsModalRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };

    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setIsSettingsOpen(false);
      }
    };

    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isSettingsOpen]);

  const handleColorChange = (color) => {
    localStorage.setItem(`eventColor_${userId}`, color);
    onColorChange(color);
    setIsSettingsOpen(false);
  };

  const handleSoundToggle = (e) => {
    const newValue = e.target.checked;
    setPlayNotificationSound(newValue);
    localStorage.setItem(`playNotificationSound_${userId}`, JSON.stringify(newValue));
  };

  return (
    <>
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="settings-btn"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-gear"
          viewBox="0 0 16 16"
        >
          <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
          <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.433 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l-.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
        </svg>
        <span className="settings-text">Settings</span>
      </button>
      {isSettingsOpen && (
        <div className="settings-modal-overlay">
          <div className="settings-modal" ref={settingsModalRef}>
            <button
              className="modal-close-btn"
              onClick={() => setIsSettingsOpen(false)}
              aria-label="Close"
            >
              X
            </button>
            <h2>Settings</h2>
            <div className="settings-content">
              <label>Calendar event color:</label>
              <div className="color-options">
                {predefinedColors.map((color) => (
                  <div
                    key={color.value}
                    className={`color-option ${eventColor === color.value ? 'selected' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorChange(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
              {/* Toggle Play Notification Sound */}
              <div className="setting-item">
                <label>Play notification sound:</label>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={playNotificationSound}
                    onChange={handleSoundToggle}
                  />
                  <span className="slider round"></span>
                </label>
                <small>{playNotificationSound ? 'Enabled' : 'Disabled'}</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsComponent;