import React, { useState, useEffect, useRef } from 'react';

const EditUserForm = ({ user, onEditUser, onClose }) => {
  // Stări pentru câmpurile de bază
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user.role || '');

  // Stări pentru câmpurile comune (Player, Manager, Staff)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const [history, setHistory] = useState([{ club: '', startYear: '', endYear: '' }]);
  const [image, setImage] = useState(null);

  // Stări pentru câmpurile specifice Player
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [position, setPosition] = useState('');
  const [shirtNumber, setShirtNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [preferredFoot, setPreferredFoot] = useState('right');
  const [status, setStatus] = useState('notInjured');

  // Stări pentru câmpurile specifice Staff
  const [staffRole, setStaffRole] = useState('');
  const [certifications, setCertifications] = useState([{ name: '', year: '' }]);

  const formRef = useRef(null); // Referință către formular

  // Detectăm clic-urile în afara formularului
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        onClose(); // Închide formularul
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Preîncarcă datele utilizatorului existent
  useEffect(() => {
    if (user.role === 'player' && user.playerId) {
      setFirstName(user.playerId.firstName || '');
      setLastName(user.playerId.lastName || '');
      setDateOfBirth(user.playerId.dateOfBirth ? new Date(user.playerId.dateOfBirth).toISOString().split('T')[0] : '');
      setNationality(user.playerId.nationality || '');
      setHeight(user.playerId.height || '');
      setWeight(user.playerId.weight || '');
      setHistory(user.playerId.history && user.playerId.history.length > 0 ? user.playerId.history : [{ club: '', startYear: '', endYear: '' }]);
      setPosition(user.playerId.position || '');
      setShirtNumber(user.playerId.shirtNumber || '');
      setPhoneNumber(user.playerId.phoneNumber || '');
      setPreferredFoot(user.playerId.preferredFoot || 'right');
      setStatus(user.playerId.status || 'notInjured');
    } else if (user.role === 'manager' && user.managerId) {
      setFirstName(user.managerId.firstName || '');
      setLastName(user.managerId.lastName || '');
      setDateOfBirth(user.managerId.dateOfBirth ? new Date(user.managerId.dateOfBirth).toISOString().split('T')[0] : '');
      setNationality(user.managerId.nationality || '');
      setHistory(user.managerId.history && user.managerId.history.length > 0 ? user.managerId.history : [{ club: '', startYear: '', endYear: '' }]);
    } else if (user.role === 'staff' && user.staffId) {
      setFirstName(user.staffId.firstName || '');
      setLastName(user.staffId.lastName || '');
      setDateOfBirth(user.staffId.dateOfBirth ? new Date(user.staffId.dateOfBirth).toISOString().split('T')[0] : '');
      setNationality(user.staffId.nationality || '');
      setStaffRole(user.staffId.role || '');
      setHistory(user.staffId.history && user.staffId.history.length > 0 ? user.staffId.history : [{ club: '', startYear: '', endYear: '' }]);
      setCertifications(user.staffId.certifications && user.staffId.certifications.length > 0 ? user.staffId.certifications : [{ name: '', year: '' }]);
    }
  }, [user]);

  const handleAddHistory = () => {
    setHistory([...history, { club: '', startYear: '', endYear: '' }]);
  };

  const handleHistoryChange = (index, field, value) => {
    const updatedHistory = [...history];
    updatedHistory[index][field] = value;
    setHistory(updatedHistory);
  };

  const handleAddCertification = () => {
    setCertifications([...certifications, { name: '', year: '' }]);
  };

  const handleCertificationChange = (index, field, value) => {
    const updatedCertifications = [...certifications];
    updatedCertifications[index][field] = value;
    setCertifications(updatedCertifications);
  };

  const handleSubmit = async () => {
    if (!name || !email || !role) {
      alert('Câmpurile de bază (nume, email, rol) sunt obligatorii!');
      return;
    }

    let userData = { name, email, role };
    if (password) {
      userData.password = password; // Parola va fi actualizată doar dacă este completată
    }

    if (role === 'player') {
      if (!firstName || !lastName || !dateOfBirth || !nationality || !height || !weight || !position || !preferredFoot) {
        alert('Toate câmpurile obligatorii pentru Player sunt necesare!');
        return;
      }
      userData.playerDetails = {
        firstName,
        lastName,
        dateOfBirth,
        nationality,
        height: Number(height),
        weight: Number(weight),
        history,
        image: image || user.playerId?.image, // Păstrează imaginea existentă dacă nu se încarcă una nouă
        position,
        shirtNumber: shirtNumber ? Number(shirtNumber) : undefined,
        phoneNumber,
        preferredFoot,
        status
      };
    } else if (role === 'manager') {
      if (!firstName || !lastName || !dateOfBirth || !nationality) {
        alert('Toate câmpurile pentru Manager sunt obligatorii!');
        return;
      }
      userData.managerDetails = {
        firstName,
        lastName,
        dateOfBirth,
        nationality,
        history,
        image: image || user.managerId?.image,
      };
    } else if (role === 'staff') {
      if (!firstName || !lastName || !dateOfBirth || !nationality || !staffRole) {
        alert('Toate câmpurile pentru Staff sunt obligatorii!');
        return;
      }
      userData.staffDetails = {
        firstName,
        lastName,
        dateOfBirth,
        nationality,
        role: staffRole,
        history,
        certifications,
        image: image || user.staffId?.image,
      };
    }

    try {
      await onEditUser(user._id, userData);
      onClose(); // Închide pop-up-ul după submit
    } catch (error) {
      alert(error.message || 'Eroare la actualizarea utilizatorului!');
    }
  };

  return (
    <div className="modal-overlay">
      <div ref={formRef} className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>X</button>
        <h3>Editează utilizator</h3>
        <div className="user-form">
          {/* Câmpuri de bază */}
          <div>
            <label>Nume:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label>Parolă:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Lasă gol pentru a păstra parola actuală"
            />
          </div>
          <div>
            <label>Rol:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">Selectează rol</option>
              <option value="admin">Admin</option>
              <option value="player">Jucător</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          {/* Câmpuri comune */}
          {(role === 'player' || role === 'manager' || role === 'staff') && (
            <>
              <div>
                <label>Prenume:</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <label>Nume:</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div>
                <label>Data nașterii:</label>
                <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
              </div>
              <div>
                <label>Naționalitate:</label>
                <input type="text" value={nationality} onChange={(e) => setNationality(e.target.value)} />
              </div>
              <div>
                <label>Istoric:</label>
                {history.map((entry, index) => (
                  <div key={index} className="history-entry">
                    <input
                      type="text"
                      placeholder="Club"
                      value={entry.club}
                      onChange={(e) => handleHistoryChange(index, 'club', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="An început"
                      value={entry.startYear}
                      onChange={(e) => handleHistoryChange(index, 'startYear', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="An sfârșit"
                      value={entry.endYear}
                      onChange={(e) => handleHistoryChange(index, 'endYear', e.target.value)}
                    />
                  </div>
                ))}
                <button type="button" onClick={handleAddHistory}>Adaugă istoric</button>
              </div>
              <div>
                <label>Imagine:</label>
                <input type="file" onChange={(e) => setImage(e.target.files[0])} />
              </div>
            </>
          )}

          {/* Player – Câmpuri noi */}
          {role === 'player' && (
            <>
              <div>
                <label>Înălțime (cm):</label>
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
              </div>
              <div>
                <label>Greutate (kg):</label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
              <div>
                <label>Poziție:</label>
                <select value={position} onChange={(e) => setPosition(e.target.value)}>
                  <option value="">Selectează poziția</option>
                  <option value="Goalkeeper">Portar</option>
                  <option value="Defender">Fundaș</option>
                  <option value="Midfielder">Mijlocaș</option>
                  <option value="Forward">Atacant</option>
                </select>
              </div>
              <div>
                <label>Număr tricou:</label>
                <input type="number" value={shirtNumber} onChange={(e) => setShirtNumber(e.target.value)} />
              </div>
              <div>
                <label>Număr de telefon:</label>
                <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Ex. +40712345678" />
              </div>
              <div>
                <label>Picior preferat:</label>
                <select value={preferredFoot} onChange={(e) => setPreferredFoot(e.target.value)}>
                  <option value="right">Drept</option>
                  <option value="left">Stâng</option>
                  <option value="both">Ambele</option>
                </select>
              </div>
              <div>
                <label>Stare:</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="notInjured">Nu este accidentat</option>
                  <option value="recovering">În recuperare</option>
                  <option value="injured">Accidentat</option>
                </select>
              </div>
            </>
          )}

          {/* Staff */}
          {role === 'staff' && (
            <>
              <div>
                <label>Rol Staff:</label>
                <select value={staffRole} onChange={(e) => setStaffRole(e.target.value)}>
                  <option value="">Selectează rol</option>
                  <option value="Fitness Coach">Fitness Coach</option>
                  <option value="Goalkeeping Coach">Goalkeeping Coach</option>
                  <option value="Set Piece Coach">Set Piece Coach</option>
                  <option value="Assistant Coach">Assistant Coach</option>
                  <option value="Nutritionist">Nutritionist</option>
                  <option value="Video Analyst">Video Analyst</option>
                  <option value="Physiotherapist">Physiotherapist</option>
                </select>
              </div>
              <div>
                <label>Certificări:</label>
                {certifications.map((cert, index) => (
                  <div key={index} className="certification-entry">
                    <input
                      type="text"
                      placeholder="Nume certificare"
                      value={cert.name}
                      onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="An"
                      value={cert.year}
                      onChange={(e) => handleCertificationChange(index, 'year', e.target.value)}
                    />
                  </div>
                ))}
                <button type="button" onClick={handleAddCertification}>Adaugă certificare</button>
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" onClick={handleSubmit}>Actualizează</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserForm;