import React, { useEffect, useState } from 'react';
import axios from 'axios';

function TestConnection() {
  const [status, setStatus] = useState('Testing connection...');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL || 'https://ticket-system-dakb.onrender.com'}/tickets/`)
      .then(response => {
        setStatus('✅ Connected to Django! Got response: ' + JSON.stringify(response.data));
      })
      .catch(error => {
        setStatus('❌ Connection failed: ' + error.message);
      });
  }, []);

  return (
    <div>
      <h1>Connection Test</h1>
      <p>{status}</p>
    </div>
  );
}

export default TestConnection;