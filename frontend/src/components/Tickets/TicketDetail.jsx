import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Sidebar from '../Dashboard/Sidebar/Sidebar';
import Topbar from '../Dashboard/Topbar/Topbar';
import './TicketDetail.css';

const TicketDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [replies, setReplies] = useState([]);
    const [activeAction, setActiveAction] = useState(null);
    const [replyText, setReplyText] = useState('');

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

      fetch(`http://localhost:8000/api/tickets/${id}/replies/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        }
      })
        .then(response => response.json())
        .then(data => {
          console.log('Replies data:', data);
          // Handle if data is an array or an object with results
          if (Array.isArray(data)) {
            setReplies(data);
          } else if (data.results && Array.isArray(data.results)) {
            setReplies(data.results);
          } else {
            setReplies([]);
          }
        })
        .catch(error => {
          console.error('Error fetching replies:', error);
          setReplies([]);
        });
    }, [id]);

    const handleLogout = () => {
      localStorage.removeItem('token');
      navigate('/login');
    };

    const handleSend = () => {
      const token = localStorage.getItem('token');
      
      if (activeAction === 'reply') {
        fetch(`http://localhost:8000/api/tickets/${id}/replies/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            body: replyText,
            is_staff_reply: true
          })
        })
          .then(response => response.json())
          .then(data => {
            setReplies([...replies, data]);
            setReplyText('');
            setActiveAction(null);
          })
          .catch(error => {
            console.error('Error sending reply:', error);
          });
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
      <div className="ticket-detail-page">
        <Sidebar />
        <Topbar onLogout={handleLogout} />

        <div className="main-content">
          <div className="ticket-header">
            <h1>{ticket.subject}</h1>
          </div>

          <div className="conversation-thread">
            <div className="message-card">
              <div className="message-header">
                <strong>{ticket.sender}</strong>
                <span className="message-time">{new Date(ticket.created_at).toLocaleString()}</span>
              </div>
              <div className="message-body">
                <p>{ticket.body}</p>
              </div>
            </div>

            {Array.isArray(replies) && replies.map(reply => (
              <div key={reply.id} className={`message-card ${reply.is_staff_reply ? 'staff-message' : 'customer-message'}`}>
                <div className="message-header">
                  <strong>{reply.sender}</strong>
                  <span className="message-time">{new Date(reply.created_at).toLocaleString()}</span>
                </div>
                <div className="message-body">
                  <p>{reply.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="ticket-actions">
            <button onClick={() => setActiveAction('reply')}>Reply</button>
            <button onClick={() => setActiveAction('note')}>Add note</button>
            <button onClick={() => setActiveAction('forward')}>Forward</button>
          </div>

          {activeAction && (
            <div className="reply-box">
              <textarea 
                placeholder={`Enter your ${activeAction}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              ></textarea>
              <button onClick={handleSend}>Send</button>
              <button onClick={() => setActiveAction(null)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    );
};

export default TicketDetail;