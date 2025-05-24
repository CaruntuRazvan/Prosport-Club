import { jwtDecode } from 'jwt-decode';

const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  console.log('apiFetch - URL:', url);
  console.log('apiFetch - Token:', token);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log('apiFetch - Response Status:', response.status);

  let data;
  try {
    data = await response.json();
    console.log('apiFetch - Response Data:', data);
  } catch (error) {
    console.log('apiFetch - Eroare la parsarea JSON:', error);
    data = { message: 'Eroare la parsarea răspunsului.' };
  }

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const loginUser = async (email, password) => {
  try {
    const data = await apiFetch(`${process.env.REACT_APP_API_URL}/users/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    console.log('Răspuns de la backend:', data);

    if (data.token) {
      localStorage.setItem('token', data.token);
    } else {
      throw new Error('Token-ul nu a fost primit de la backend.');
    }

    return data;
  } catch (error) {
    console.error('Eroare la autentificare:', error);
    throw error;
  }
};

export const verifyAuth = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  return await apiFetch(`${process.env.REACT_APP_API_URL}/verify-auth`, {
    method: 'GET',
  });
};

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};