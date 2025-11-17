import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Dashboard/Sidebar/Sidebar';
import Topbar from '../Dashboard/Topbar/Topbar';
import './TicketList.css';

const TicketList = () => {
  // State to store our tickets
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the token from localStorage (assuming you stored it during login)
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:8000/api/tickets/', {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(data => {
        // Make sure data is an array before setting it
        if (Array.isArray(data)) {
          setTickets(data);
        } else {
          // If the API returns an object with a results property
          setTickets(data.results || []);
        }
        console.log('Tickets loaded:', data);
      })
      .catch(error => {
        console.error('Error fetching tickets:', error);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <Topbar onLogout={handleLogout} />
      
      <div className="main-content">
        <div className="ticket-list">
          <ul>
            {tickets.map(ticket => (
              <li key={ticket.id} className="ticket-item">
                <h3>{ticket.subject}</h3>
                <p>From: {ticket.sender}</p>
                <p>Status: {ticket.status} • Priority: {ticket.priority}</p>
                <p>Assigned to: {ticket.assigned_to ? ticket.assigned_to.username : 'Unassigned'}</p>
                <p>Created: {new Date(ticket.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TicketList;