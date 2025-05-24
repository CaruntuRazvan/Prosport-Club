// Creează o amendă
export const createFine = async (fineData) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/fines`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(fineData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la crearea penalizării: ${errorText || 'Server error'}`);
  }

  return await response.json();
};

// Preluare penalizări
export const fetchFines = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/fines`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la preluarea penalizărilor: ${errorText || 'Server error'}`);
  }

  return await response.json();
};

// Ștergere penalizare
export const deleteFine = async (fineId) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/fines/${fineId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la ștergerea penalizării: ${errorText || 'Server error'}`);
  }

  return await response.json();
};

// Solicitare confirmare plată (jucător)
export const requestPaymentConfirmation = async (fineId) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/fines/${fineId}/request-payment`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la solicitarea confirmării plății: ${errorText || 'Server error'}`);
  }

  return await response.json();
};

// Actualizare stare plată (antrenor/staff aprobă plata)
export const updateFineStatus = async (fineId, isPaid) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/fines/${fineId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ isPaid }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la actualizarea stării de plată: ${errorText || 'Server error'}`);
  }

  return await response.json();
};

// Respinge solicitarea de plată (antrenor/staff)
export const rejectPaymentRequest = async (fineId) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/fines/${fineId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ paymentRequested: false }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la respingerea solicitării de plată: ${errorText || 'Server error'}`);
  }

  return await response.json();
};

export const resetAllFines = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/fines/reset-all`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la ștergerea tuturor amenzilor: ${errorText || 'Server error'}`);
  }

  return await response.json();
};

export const resetUserFines = async (userId) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/fines/reset-user/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la ștergerea amenzilor utilizatorului: ${errorText || 'Server error'}`);
  }

  return await response.json();
};

// Exportă amenzile în CSV
export const exportFinesToCSV = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/fines/export-csv`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eroare la exportarea amenzilor în CSV: ${errorText || 'Server error'}`);
  }

  return response; // Returnăm răspunsul brut, deoarece este un blob
};