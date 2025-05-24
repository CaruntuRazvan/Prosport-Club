export const fetchInjuries = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/injuries`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Accidentări preluate:', data);
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
  
  export const createInjury = async (injuryData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token-ul nu este disponibil. Te rugăm să te autentifici.');
      }
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/injuries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(injuryData),
      });
  
      const data = await response.json();
      if (response.ok) {
        return data.injury;
      } else {
        throw new Error(data.message || 'Eroare la crearea accidentării.');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  
  export const updateInjury = async (injuryId, injuryData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token-ul nu este disponibil. Te rugăm să te autentifici.');
      }
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/injuries/${injuryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(injuryData),
      });
  
      const data = await response.json();
      if (response.ok) {
        return data.injury;
      } else {
        throw new Error(data.message || 'Eroare la actualizarea accidentării.');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };