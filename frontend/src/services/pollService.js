// Funcție pentru crearea unui sondaj nou
export const createPoll = async (pollData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.REACT_APP_API_URL}/polls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pollData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData || { message: 'Eroare la crearea sondajului' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Eroare la crearea sondajului:', error);
    throw error;
  }
};

// Funcție pentru votarea într-un sondaj
export const voteInPoll = async (pollId, optionIndex) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.REACT_APP_API_URL}/polls/${pollId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ optionIndex }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData || { message: 'Eroare la votare' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Eroare la votare:', error);
    throw error;
  }
};

// Funcție pentru preluarea tuturor sondajelor
export const fetchPolls = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.REACT_APP_API_URL}/polls`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData || { message: 'Eroare la preluarea sondajelor' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Eroare la preluarea sondajelor:', error);
    throw error;
  }
};

// Funcție pentru preluarea unui sondaj specific (inclusiv rezultatele)
export const fetchPollById = async (pollId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.REACT_APP_API_URL}/polls/${pollId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData || { message: 'Eroare la preluarea sondajului' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Eroare la preluarea sondajului:', error);
    throw error;
  }
};

// Funcție pentru ștergerea unui sondaj
export const deletePoll = async (pollId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.REACT_APP_API_URL}/polls/${pollId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData || { message: 'Eroare la ștergerea sondajului' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Eroare la ștergerea sondajului:', error);
    throw error;
  }
};

// Funcție pentru ștergerea tuturor sondajelor (doar admin)
export const resetAllPolls = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.REACT_APP_API_URL}/polls/reset-all`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData || { message: 'Eroare la ștergerea tuturor sondajelor' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Eroare la ștergerea tuturor sondajelor:', error);
    throw error;
  }
};

// Funcție pentru ștergerea sondajelor asociate unui utilizator (doar admin)
export const resetUserPolls = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.REACT_APP_API_URL}/polls/reset-user/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData || { message: 'Eroare la ștergerea sondajelor utilizatorului' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Eroare la ștergerea sondajelor utilizatorului:', error);
    throw error;
  }
};