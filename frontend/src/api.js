import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/login/`, {
    username,
    password
  });
  return response.data;
};

export const getTickets = async (token) => {
  const response = await axios.get(`${API_URL}/tickets/`, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};

export const getEmails = async (token) => {
  const response = await axios.get(`${API_URL}/emails/`, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};