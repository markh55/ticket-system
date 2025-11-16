import React, { useState, useEffect } from 'react';

export default function EventModal({ isOpen, onClose, onSave, onDelete, selectedDate, selectedEvent }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [invitees, setInvitees] = useState([]);
  const [emailInput, setEmailInput] = useState('');

  // Prefill form when editing or opening modal
  useEffect(() => {
    if (selectedEvent) {
      setTitle(selectedEvent.title || '');
      setDescription(selectedEvent.description || '');
      setDate(selectedEvent.start.toISOString().slice(0, 10));
      setStartTime(selectedEvent.start.toTimeString().slice(0, 5));
      setEndTime(selectedEvent.end.toTimeString().slice(0, 5));
      setInvitees(selectedEvent.invitees || []);
    } else if (selectedDate) {
      setTitle('');
      setDescription('');
      setDate(selectedDate.toISOString().slice(0, 10));
      setStartTime('09:00');
      setEndTime('10:00');
      setInvitees([]);
    }
    setEmailInput('');
  }, [selectedEvent, selectedDate]);

  const handleAddInvitee = () => {
    const email = emailInput.trim();
    if (email && email.includes('@') && !invitees.includes(email)) {
      setInvitees([...invitees, email]);
      setEmailInput('');
    }
  };

  const handleRemoveInvitee = (emailToRemove) => {
    setInvitees(invitees.filter(email => email !== emailToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddInvitee();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const [startHour, startMinute] = startTime.split(':');
    const [endHour, endMinute] = endTime.split(':');

    const start = new Date(date);
    start.setHours(parseInt(startHour), parseInt(startMinute));

    const end = new Date(date);
    end.setHours(parseInt(endHour), parseInt(endMinute));

    onSave({
      title,
      description,
      start,
      end,
      invitees
    });

    onClose();
  };

  const handleDelete = () => {
    if (selectedEvent && window.confirm(`Delete event "${selectedEvent.title}"?`)) {
      onDelete(selectedEvent.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{selectedEvent ? "Edit Event" : "Add Event"}</h2>
        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Event Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="Enter event title"
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add event details..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Invite People</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter email address"
                style={{ flex: 1 }}
              />
              <button 
                type="button" 
                onClick={handleAddInvitee}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(99, 102, 241, 0.8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
            
            {invitees.length > 0 && (
              <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {invitees.map((email, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      background: 'rgba(99, 102, 241, 0.2)',
                      borderRadius: '20px',
                      fontSize: '14px',
                      color: '#e2e8f0'
                    }}
                  >
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInvitee(email)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '0',
                        lineHeight: '1'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Cancel + Save Buttons */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button type="button" onClick={onClose} className="btn-cancel">
                Cancel
              </button>
              <button type="submit" className="btn-save">
                {selectedEvent ? "Save Changes" : "Add Event"}
              </button>
            </div>

            {/* Delete Button */}
            {selectedEvent && (
              <button type="button" onClick={handleDelete} className="btn-delete">
                Delete
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}