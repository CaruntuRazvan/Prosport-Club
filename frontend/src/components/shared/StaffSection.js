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
        console.log('Managers fetched:', managerData);
        setManagers(managerData);

        const staffData = await fetchStaff();
        console.log('Staff members fetched:', staffData);
        setStaffMembers(staffData);
      } catch (err) {
        setError('Error loading data.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const renderManagersList = () => (
    managers.length > 0 ? (
      <div className="staff-category">
        <h2>Managers</h2>
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
                      ? `${process.env.REACT_APP_URL}${manager.managerId.image}`
                      : '/images/default-user.jpg'
                  }
                  alt={`${manager.managerId?.firstName} ${manager.managerId?.lastName}`}
                  className="staff-image"
                  draggable="false"
                  onClick={() => onStaffClick && onStaffClick(manager)}
                  onError={(e) => {
                    e.target.src = '/images/default-user.jpg';
                    console.log(`Error loading image for ${manager.managerId?.firstName} ${manager.managerId?.lastName}`);
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
    ) : (
      <div className="no-managers-message">No managers available.</div>
    )
  );

  const renderStaffList = () => (
    staffMembers.length > 0 ? (
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
                    console.log(`Error loading image for ${staff.staffId?.firstName} ${staff.staffId?.lastName}`);
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
    ) : (
      <div className="no-staff-message">No staff members available.</div>
    )
  );

  if (loading) return <div className="loading-message">Loading data...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="staff-section">
      {renderManagersList()}
      {renderStaffList()}
    </div>
  );
};

export default StaffSection;