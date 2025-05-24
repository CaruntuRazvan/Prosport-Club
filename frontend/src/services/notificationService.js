// Preluare notificări pentru un utilizator
export const getNotificationsForUser = async (userId) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/notifications/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la preluarea notificărilor: ${errorText || 'Server error'}`);
  }

  const data = await response.json();
  return data;
};

// Marcarea unei notificări ca citită
export const markNotificationAsRead = async (notificationId) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la marcarea notificării ca citită: ${errorText || 'Server error'}`);
  }

  const data = await response.json();
  return data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/notifications/mark-all-read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la marcarea tuturor notificărilor ca citite: ${errorText || 'Server error'}`);
  }

  const data = await response.json();
  return data;
};

// Ștergerea unei notificări
export const deleteNotification = async (notificationId) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la ștergerea notificării: ${errorText || 'Server error'}`);
  }

  const data = await response.json();
  return data;
};