import axios from 'axios';

const API_URL = 'https://ticket-system-dakb.onrender.com';

export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/api/login/`, {
    username,
    password
  });
  return response.data;
};

export const getTickets = async (token) => {
  const response = await axios.get(`${API_URL}/api/tickets/`, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};

export const getEmails = async (token) => {
  const response = await axios.get(`${API_URL}/api/emails/`, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};

export const getCurrentUser = async (token) => {
  const response = await axios.get(`${API_URL}/api/user/`, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};