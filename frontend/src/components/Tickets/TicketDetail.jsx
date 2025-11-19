import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Sidebar from '../Dashboard/Sidebar/Sidebar';
import Topbar from '../Dashboard/Topbar/Topbar';
import './TicketDetail.css';

const TicketDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [activeAction, setActiveAction] = useState(null);

    useEffect(() => {
      const token = localStorage.getItem('token');
      
      fetch(`http://localhost:8000/api/tickets/${id}/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        }
      })
        .then(response => response.json())
        .then(data => {
          setTicket(data);
        })
        .catch(error => {
          console.error('Error fetching ticket:', error);
        });
    }, [id]);

    const handleLogout = () => {
      localStorage.removeItem('token');
      navigate('/login');
    };

    const handleSend = () => {
      if (activeAction === 'reply') {
        // send reply
      } else if (activeAction === 'note') {
        // add note
      } else if (activeAction === 'forward') {
        // forward ticket
      }
    };

    if (!ticket) {
      return <div>Loading...</div>;
    }

    return (
      <div className="dashboard-container">
        <Sidebar />
        <Topbar onLogout={handleLogout} />

        <div className="main-content">
          <div className="ticket-header">
            <h1>{ticket.subject}</h1>
            <p className="ticket-meta"><strong>From:</strong> {ticket.sender}</p>
            <p className="ticket-meta"><strong>Status:</strong> {ticket.status}</p>
            <p className="ticket-meta"><strong>Priority:</strong> {ticket.priority}</p>
            <p className="ticket-meta"><strong>Created:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
          </div>
          
          <div className="ticket-body">
            <p>{ticket.body}</p>
          </div>

          <div className="ticket-actions">
            <button onClick={() => setActiveAction('reply')}>Reply</button>
            <button onClick={() => setActiveAction('note')}>Add note</button>
            <button onClick={() => setActiveAction('forward')}>Forward</button>

            {activeAction && (
              <div className="reply-box">
                <textarea placeholder={`Enter your ${activeAction}...`}></textarea>
                <button onClick={handleSend}>Send</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
};

export default TicketDetail;