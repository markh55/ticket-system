import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Sidebar from '../Dashboard/Sidebar/Sidebar';
import Topbar from '../Dashboard/Topbar/Topbar';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handlePasswordChange = (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:8000/api/change-password/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        old_password: currentPassword,
        new_password: newPassword,
      })
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw err; });
        }
        return response.json();
      })
      .then(data => {
        alert('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      })
      .catch(error => {
        console.error('Error changing password:', error);
        alert(error.old_password || error.new_password || 'Failed to change password');
      });
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

        <div className="settings-section">
          <h2>Change Password</h2>
          <form className="password-form" onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>Current Password</label>
              <input 
                type="password" 
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;