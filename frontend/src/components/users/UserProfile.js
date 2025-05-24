// components/UserProfile.js
import React, { useEffect, useRef } from 'react';
//import '../styles/UserProfile.css';

const UserProfile = ({ user, onClose, calculateAge }) => {
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!user) return null;

  // Determinăm imaginea în funcție de rolul utilizatorului
  const getProfileImage = () => {
    const baseUrl = process.env.REACT_APP_URL;
    if (user.role === 'player' && user.playerId?.image) {
      return `${baseUrl}${user.playerId.image}`;
    }
    if (user.role === 'staff' && user.staffId?.image) {
      return `${baseUrl}${user.staffId.image}`;
    }
    if (user.role === 'manager' && user.managerId?.image) {
      return `${baseUrl}${user.managerId.image}`;
    }
    return null; // Fallback pentru cazul în care nu există imagine
  };
  
  const profileImage = getProfileImage();
  
  return (
    <div className="modal-overlay">
      <div ref={profileRef} className="modal-content user-profile">
        <button className="modal-close-btn" onClick={onClose}>X</button>
        <div className="profile-header">
          <div className="profile-avatar">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="profile-image" draggable='false'/>
            ) : (
              <span>{user.name.split(' ').map(word => word.charAt(0).toUpperCase()).join('')}</span>
            )}
          </div>
          <h3 className="profile-name">
            {user.role === 'player' && user.playerId && `${user.playerId.firstName} ${user.playerId.lastName}`}
            {user.role === 'manager' && user.managerId && `${user.managerId.firstName} ${user.managerId.lastName}`}
            {user.role === 'staff' && user.staffId && `${user.staffId.firstName} ${user.staffId.lastName}`}
            {user.role === 'admin' && user.name}
          </h3>
          <span className="profile-role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
        </div>

        <div className="profile-details">
          {user.role === 'player' && user.playerId && (
            <>
              <h4>Informații personale</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Prenume:</span>
                  <span className="info-value">{user.playerId.firstName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Nume:</span>
                  <span className="info-value">{user.playerId.lastName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Vârsta:</span>
                  <span className="info-value">{calculateAge(user.playerId.dateOfBirth)} ani</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Naționalitate:</span>
                  <span className="info-value">{user.playerId.nationality}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Înălțime:</span>
                  <span className="info-value">{user.playerId.height} cm</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Greutate:</span>
                  <span className="info-value">{user.playerId.weight} kg</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Poziție:</span>
                  <span className="info-value">
                    {user.playerId.position === 'Goalkeeper' ? 'Portar' :
                     user.playerId.position === 'Defender' ? 'Fundaș' :
                     user.playerId.position === 'Midfielder' ? 'Mijlocaș' :
                     user.playerId.position === 'Forward' ? 'Atacant' :
                     user.playerId.position}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Număr tricou:</span>
                  <span className="info-value">{user.playerId.shirtNumber || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Număr de telefon:</span>
                  <span className="info-value">{user.playerId.phoneNumber || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Picior preferat:</span>
                  <span className="info-value">
                    {user.playerId.preferredFoot === 'right' ? 'Drept' :
                     user.playerId.preferredFoot === 'left' ? 'Stâng' :
                     user.playerId.preferredFoot === 'both' ? 'Ambele' :
                     user.playerId.preferredFoot}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Stare:</span>
                  <span className="info-value">
                    {user.playerId.status === 'notInjured' ? 'Nu este accidentat' :
                     user.playerId.status === 'recovering' ? 'În recuperare' :
                     user.playerId.status === 'injured' ? 'Accidentat' :
                     user.playerId.status}
                  </span>
                </div>
              </div>

              {user.playerId.history && user.playerId.history.length > 0 && (
                <div className="profile-section">
                  <h4>Istoric cluburi</h4>
                  <ul className="history-list">
                    {user.playerId.history.map((entry, index) => (
                      <li key={index}>
                        {entry.club} ({entry.startYear} - {entry.endYear})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {user.role === 'manager' && user.managerId && (
            <>
              <h4>Informații personale</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Prenume:</span>
                  <span className="info-value">{user.managerId.firstName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Nume:</span>
                  <span className="info-value">{user.managerId.lastName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Vârsta:</span>
                  <span className="info-value">{calculateAge(user.managerId.dateOfBirth)} ani</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Naționalitate:</span>
                  <span className="info-value">{user.managerId.nationality}</span>
                </div>
              </div>

              {user.managerId.history && user.managerId.history.length > 0 && (
                <div className="profile-section">
                  <h4>Istoric cluburi</h4>
                  <ul className="history-list">
                    {user.managerId.history.map((entry, index) => (
                      <li key={index}>
                        {entry.club} ({entry.startYear} - {entry.endYear})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {user.role === 'staff' && user.staffId && (
            <>
              <h4>Informații personale</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Prenume:</span>
                  <span className="info-value">{user.staffId.firstName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Nume:</span>
                  <span className="info-value">{user.staffId.lastName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Vârsta:</span>
                  <span className="info-value">{calculateAge(user.staffId.dateOfBirth)} ani</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Naționalitate:</span>
                  <span className="info-value">{user.staffId.nationality}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Rol:</span>
                  <span className="info-value">{user.staffId.role}</span>
                </div>
              </div>

              {user.staffId.certifications && user.staffId.certifications.length > 0 && (
                <div className="profile-section">
                  <h4>Certificări</h4>
                  <ul className="certifications-list">
                    {user.staffId.certifications.map((cert, index) => (
                      <li key={index}>{cert.name} ({cert.year})</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {user.role === 'admin' && (
            <>
              <h4>Informații personale</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Nume:</span>
                  <span className="info-value">{user.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user.email}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;