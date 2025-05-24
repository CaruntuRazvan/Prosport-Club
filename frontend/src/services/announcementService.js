export const fetchAnnouncements = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements?limit=5`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
    if (response.ok) {
      console.log('Announcements Loaded:', data);
      return data;
    } else {
      console.error('Error:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export const createAnnouncement = async (announcementData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token-ul nu este disponibil. Te rugăm să te autentifici.');
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(announcementData),
    });

    const data = await response.json();
    if (response.ok) {
      return data.announcement;
    } else {
      throw new Error(data.message || 'Eroare la crearea anunțului.');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const updateAnnouncement = async (announcementId, announcementData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token-ul nu este disponibil. Te rugăm să te autentifici.');
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements/${announcementId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(announcementData),
    });

    const data = await response.json();
    if (response.ok) {
      return data.announcement;
    } else {
      throw new Error(data.message || 'Eroare la actualizarea anunțului.');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const deleteAnnouncement = async (announcementId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token-ul nu este disponibil. Te rugăm să te autentifici.');
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements/${announcementId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      return data.message;
    } else {
      throw new Error(data.message || 'Eroare la ștergerea anunțului.');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};