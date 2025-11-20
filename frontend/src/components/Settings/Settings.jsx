import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Sidebar from '../Dashboard/Sidebar/Sidebar';
import Topbar from '../Dashboard/Topbar/Topbar';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:8000/api/user/', {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('Current User:', data);
        setCurrentUser(data);
      })
      .catch(error => {
        console.error('Error fetching user:', error);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="settings-page">
      <Sidebar />
      <Topbar onLogout={handleLogout} />

      <div className="main-content">
        <h1>Settings</h1>
        {currentUser ? (
          <div className="user-info">
            <p><strong>Username:</strong> {currentUser.username}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>First Name:</strong> {currentUser.first_name}</p>
            <p><strong>Last Name:</strong> {currentUser.last_name}</p>
            <p><strong>Is Superuser:</strong> {currentUser.is_superuser ? 'Yes' : 'No'}</p>
          </div>
        ) : (
          <p>Loading user information...</p>
        )}
      </div>
    </div>
  );
};

export default Settings;