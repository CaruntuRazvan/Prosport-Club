import React, { useState, useEffect, useRef } from 'react';
import { getNotificationsForUser, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../../services/notificationService';
import '../../styles/shared/NotificationsDropdown.css';

const NotificationsDropdown = ({ userId, setActiveSection, playNotificationSound }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [lastAnnouncedCount, setLastAnnouncedCount] = useState(0); 
  const [hasInteracted, setHasInteracted] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotificationsForUser(userId);
        const newNotifications = data.notifications || [];
        setNotifications(newNotifications);
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error.message);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    // Play sound only when the user opens the dropdown and there are new unread notifications
    if (isDropdownOpen && hasInteracted && playNotificationSound) {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      const newUnreadCount = unreadNotifications.length;

      if (newUnreadCount > lastAnnouncedCount) {
        const audio = new Audio('/sounds/notification.wav');
        audio.play().catch(error => {
          console.error('Error playing notification sound:', error);
        });
        setLastAnnouncedCount(newUnreadCount); // Update the number of announced notifications
      }
    }
  }, [isDropdownOpen, hasInteracted, playNotificationSound, notifications, lastAnnouncedCount]);

  const formatDate = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return 'A few seconds ago';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return notificationDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification._id);
        setUnreadCount((prev) => prev - 1);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
      }
      if (notification.section) {
        setActiveSection(notification.section);
      }
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error handling notification:', error.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
      setLastAnnouncedCount(notifications.length); // Update to prevent sound replay
    } catch (error) {
      console.error('Error marking all notifications as read:', error.message);
    }
  };

  const handleDeleteNotification = async (notificationId, isRead) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      if (!isRead) {
        setUnreadCount((prev) => prev - 1);
        setLastAnnouncedCount((prev) => prev - 1); // Adjust to maintain synchronization
      }
    } catch (error) {
      console.error('Error deleting notification:', error.message);
    }
  };

  const toggleUnreadFilter = () => {
    setShowUnreadOnly((prev) => !prev);
  };

  const filteredNotifications = showUnreadOnly
    ? notifications.filter((notification) => !notification.isRead)
    : notifications;

  return (
    <div className="notifications-dropdown" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsDropdownOpen(!isDropdownOpen);
          setHasInteracted(true);
        }}
        className="notifications-btn"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-bell"
          viewBox="0 0 16 16"
        >
          <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z" />
        </svg>
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
        <span className="notifications-text">Notifications</span>
      </button>

      {isDropdownOpen && (
        <div className="dropdown-menu">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              <p>You have no new notifications.</p>
            </div>
          ) : (
            <>
              <div className="notifications-header">
                <button
                  onClick={toggleUnreadFilter}
                  className="show-unread-btn"
                  disabled={unreadCount === 0}
                >
                  {showUnreadOnly ? 'All' : 'Unread'}
                </button>
                <button
                  onClick={handleMarkAllAsRead}
                  className="mark-all-read-btn"
                  disabled={unreadCount === 0}
                >
                  Mark All Read
                </button>
              </div>
              <div className="notifications-list">
                {filteredNotifications.length === 0 ? (
                  <div className="no-notifications">
                    <p>You have no unread notifications.</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                    >
                      <div
                        className="notification-content"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        {!notification.isRead && <span className="unread-dot"></span>}
                        <div className="notification-text">
                          <strong>{notification.title}</strong> - {notification.description}{' '}
                          <span className="notification-date">
                            ({formatDate(notification.createdAt)})
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteNotification(notification._id, notification.isRead)
                        }
                        className="delete-btn"
                        title="Delete notification"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-trash"
                          viewBox="0 0 16 16"
                        >
                          <path d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5z" />
                          <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;