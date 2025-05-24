// components/StaffSection.js
import React, { useState, useEffect } from 'react';
import { fetchStaff, fetchManagers } from '../../services/userService';
import '../../styles/shared/StaffSection.css';

const StaffSection = ({ onStaffClick, currentUserId }) => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const managerData = await fetchManagers();
        console.log('Manageri preluați:', managerData);
        setManagers(managerData);

        const staffData = await fetchStaff();
        console.log('Membri staff preluați:', staffData);
        setStaffMembers(staffData);
      } catch (err) {
        setError('Eroare la încărcarea datelor.');
        console.error('Eroare:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const renderManagersList = () => (
    <div className="staff-category"> {/* Adăugăm containerul staff-category */}
      <h2>Manageri</h2>
      <div className="staff-list">
        {managers.map(manager => (
          <div
            key={manager._id}
            className={`staff-card ${manager._id === currentUserId ? 'current-user' : ''}`}
          >
            <div className="staff-image-wrapper">
              <img
                src={
                  manager.managerId?.image
                    ?`${process.env.REACT_APP_URL}${manager.managerId.image}`
                    : '/images/default-user.jpg'
                }
                alt={`${manager.managerId?.firstName} ${manager.managerId?.lastName}`}
                className="staff-image"
                draggable="false"
                onClick={() => onStaffClick && onStaffClick(manager)}
                onError={(e) => {
                  e.target.src = '/images/default-user.jpg';
                  console.log(`Eroare la încărcarea imaginii pentru ${manager.managerId?.firstName} ${manager.managerId?.lastName}`);
                }}
              />
            </div>
            <div className="staff-info">
              <span className="staff-name">{`${manager.managerId?.firstName} ${manager.managerId?.lastName}`.toUpperCase()}</span>
              <span className="staff-role">Manager</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStaffList = () => (
    <div className="staff-category"> 
      <h2>Staff</h2>
      <div className="staff-list">
        {staffMembers.map(staff => (
          <div
            key={staff._id}
            className={`staff-card ${staff._id === currentUserId ? 'current-user' : ''}`}
          >
            <div className="staff-image-wrapper">
              <img
                src={
                  staff.staffId?.image
                    ? `${process.env.REACT_APP_URL}${staff.staffId.image}`
                    : '/images/default-user.jpg'
                }
                alt={`${staff.staffId?.firstName} ${staff.staffId?.lastName}`}
                className="staff-image"
                draggable="false"
                onClick={() => onStaffClick && onStaffClick(staff)}
                loading="lazy"
                onError={(e) => {
                  e.target.src = '/images/default-user.jpg';
                  console.log(`Eroare la încărcarea imaginii pentru ${staff.staffId?.firstName} ${staff.staffId?.lastName}`);
                }}
              />
            </div>
            <div className="staff-info">
              <span className="staff-name">{`${staff.staffId?.firstName} ${staff.staffId?.lastName}`.toUpperCase()}</span>
              <span className="staff-role">{staff.staffId?.role || 'N/A'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return <div>Se încarcă datele...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="staff-section">
      {managers.length > 0 && renderManagersList()}
      {staffMembers.length > 0 ? (
        renderStaffList()
      ) : (
        <div>Nu există membri staff disponibili.</div>
      )}
    </div>
  );
};

export default StaffSection;