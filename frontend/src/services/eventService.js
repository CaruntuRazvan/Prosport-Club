// Obține toate evenimentele pentru un utilizator
export const getEvents = async (userId) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/events`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Eroare la obținerea evenimentelor');
  }

  const data = await response.json();
  return data;
};

// POST pentru crearea unui eveniment (pentru manageri și staff)
export const createEvent = async (eventData) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/events`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la crearea evenimentului: ${errorText || 'Server error'}`);
  }

  const data = await response.json();
  return data;
};

// Obține detaliile unui eveniment specific, inclusiv utilizatorii asociați
export const getEventDetails = async (eventId) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/events/${eventId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la obținerea detaliilor evenimentului: ${errorText || 'Server error'}`);
  }

  const data = await response.json();
  return data;
};

// Șterge un eveniment
export const deleteEvent = async (eventId) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la ștergerea evenimentului: ${errorText || 'Server error'}`);
  }

  return await response.json();
};

// PUT pentru editarea unui eveniment existent (pentru manageri și staff)
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Eroare la editarea evenimentului: ${errorText || 'Server error'}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Eroare în updateEvent:', error);
    throw error;
  }
};

export const resetAllEvents = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/events/reset-all`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la ștergerea tuturor evenimentelor: ${errorText || 'Server error'}`);
  }

  return await response.json();
};

export const resetUserEvents = async (userId) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/events/reset-user/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la ștergerea evenimentelor utilizatorului: ${errorText || 'Server error'}`);
  }

  return await response.json();
};