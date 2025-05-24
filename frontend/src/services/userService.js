export const fetchUsers = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users`);
    const data = await response.json();
    if (response.ok) {
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

export const fetchPlayers = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users`);
    const data = await response.json();
    if (response.ok) {
      const players = data.filter(user => user.role === 'player');
      console.log('Jucători preluați:', players);
      return players;
    } else {
      console.error('Error:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export const fetchManagers = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users?role=manager`);
    const data = await response.json();
    if (response.ok) {
      const managers = data.filter(user => user.role === 'manager');
      console.log('Manageri preluați:', managers);
      return managers;
    } else {
      console.error('Error:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export const fetchStaff = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users?role=staff`);
    const data = await response.json();
    if (response.ok) {
      const staff = data.filter(user => user.role === 'staff');
      console.log('Staff preluat:', staff);
      return staff;
    } else {
      console.error('Error:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export const addUser = async (userData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token-ul nu este disponibil. Te rugăm să te autentifici.');
    }

    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('role', userData.role);

    if (userData.playerDetails) {
      const { image, ...playerDetailsWithoutImage } = userData.playerDetails;
      formData.append('playerDetails', JSON.stringify(playerDetailsWithoutImage));
      if (image) {
        formData.append('image', image);
      }
    }
    if (userData.managerDetails) {
      const { image, ...managerDetailsWithoutImage } = userData.managerDetails;
      formData.append('managerDetails', JSON.stringify(managerDetailsWithoutImage));
      if (image) {
        formData.append('image', image);
      }
    }
    if (userData.staffDetails) {
      const { image, ...staffDetailsWithoutImage } = userData.staffDetails;
      formData.append('staffDetails', JSON.stringify(staffDetailsWithoutImage));
      if (image) {
        formData.append('image', image);
      }
    }

    console.log('Imagine trimisă:', userData.playerDetails?.image);

    const response = await fetch(`${process.env.REACT_APP_API_URL}/users/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      return data.user;
    } else {
      throw new Error(data.message || 'Eroare la adăugarea utilizatorului.');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const deleteUser = async (email) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token-ul nu este disponibil. Te rugăm să te autentifici.');
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL}/users/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (response.ok) {
      return data.message;
    } else {
      throw new Error(data.message || 'Eroare la ștergerea utilizatorului.');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const fetchCurrentUser = async (id, role) => {
  if (!['admin', 'player', 'manager', 'staff'].includes(role)) {
    console.error('Invalid role');
    return null;
  }

  const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${role}/${id}`);
  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    console.error('Error:', data.message);
    return null;
  }
};

export const editUser = async (userId, userData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token-ul nu este disponibil. Te rugăm să te autentifici.');
    }

    const formData = new FormData();

    if (userData.name) formData.append('name', userData.name);
    if (userData.email) formData.append('email', userData.email);
    if (userData.password) formData.append('password', userData.password);
    if (userData.role && ['player', 'manager', 'staff', 'admin'].includes(userData.role)) {
      formData.append('role', userData.role);
    }

    if (userData.playerDetails) {
      const { image, ...playerDetailsWithoutImage } = userData.playerDetails;
      formData.append('playerDetails', JSON.stringify(playerDetailsWithoutImage));
      if (image && typeof image !== 'string') {
        formData.append('image', image);
      }
    }
    if (userData.managerDetails) {
      const { image, ...managerDetailsWithoutImage } = userData.managerDetails;
      formData.append('managerDetails', JSON.stringify(managerDetailsWithoutImage));
      if (image && typeof image !== 'string') {
        formData.append('image', image);
      }
    }
    if (userData.staffDetails) {
      const { image, ...staffDetailsWithoutImage } = userData.staffDetails;
      formData.append('staffDetails', JSON.stringify(staffDetailsWithoutImage));
      if (image && typeof image !== 'string') {
        formData.append('image', image);
      }
    }

    console.log('userData trimis:', userData);
    console.log('Imagine trimisă:', formData.get('image'));

    const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Eroare la actualizarea utilizatorului');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Eroare la editare:', error);
    throw error;
  }
};

export const updatePlayerNutrition = async (playerId, { weight, height }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token-ul nu este disponibil. Te rugăm să te autentifici.');
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL}/users/player/${playerId}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ weight, height }),
    });

    const data = await response.json();
    if (response.ok) {
      return data.player;
    } else {
      throw new Error(data.message || 'Eroare la actualizarea datelor jucătorului.');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};