// Adăugare feedback
export const addFeedback = async (feedbackData) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/feedbacks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(feedbackData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la adăugarea feedback-ului: ${errorText || 'Server error'}`);
  }

  const data = await response.json();
  return data;
};

// Preluare feedback pentru un eveniment
export const getFeedbackForEvent = async (eventId) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/feedbacks/event/${eventId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la preluarea feedback-ului: ${errorText || 'Server error'}`);
  }

  const data = await response.json();
  return data;
};

// Preluare medii și rezumate feedback pentru un creator
export const getFeedbackSummariesByCreator = async (creatorId) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/feedbacks/summary-by-creator/${creatorId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la preluarea mediilor feedback-urilor: ${errorText || 'Server error'}`);
  }

  const data = await response.json();
  return data;
};

// Funcție pentru ștergerea tuturor feedback-urilor (doar admin)
export const resetAllFeedbacks = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.REACT_APP_API_URL}/feedbacks/reset-all`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData || { message: 'Eroare la ștergerea tuturor feedback-urilor' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Eroare la ștergerea tuturor feedback-urilor:', error);
    throw error;
  }
};

// Funcție pentru ștergerea feedback-urilor asociate unui utilizator (doar admin)
export const resetUserFeedbacks = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.REACT_APP_API_URL}/feedbacks/reset-user/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData || { message: 'Eroare la ștergerea feedback-urilor utilizatorului' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Eroare la ștergerea feedback-urilor utilizatorului:', error);
    throw error;
  }
};

// Funcție pentru ștergerea tuturor rezumatelor feedback-urilor (doar admin)
export const resetAllFeedbackSummaries = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.REACT_APP_API_URL}/feedbacks/summary/reset-all`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData || { message: 'Eroare la ștergerea tuturor rezumatelor feedback-urilor' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Eroare la ștergerea tuturor rezumatelor feedback-urilor:', error);
    throw error;
  }
};

// Funcție pentru ștergerea rezumatelor feedback-urilor asociate unui utilizator (doar admin)
export const resetUserFeedbackSummaries = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.REACT_APP_API_URL}/feedbacks/summary/reset-user/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData || { message: 'Eroare la ștergerea rezumatelor feedback-urilor utilizatorului' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Eroare la ștergerea rezumatelor feedback-urilor utilizatorului:', error);
    throw error;
  }
};