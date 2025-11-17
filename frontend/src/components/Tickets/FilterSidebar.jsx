import React, { useState, useEffect } from 'react';
import './FilterSidebar.css';

const FilterSidebar = () => {
  const [status, setStatus] = useState('any');
  const [priority, setPriority] = useState('any');
  const [assignedTo, setAssignedTo] = useState('unassigned');
  const [createdAt, setCreatedAt] = useState('any');
  const [closedAt, setClosedAt] = useState('any');
  const [resolvedAt, setResolvedAt] = useState('any');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch users from backend for the Assigned to dropdown
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:8000/api/users/', {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers(data.results || []);
        }
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, []);

  const handleApply = () => {
    // This is where you'll apply the filters to your ticket list
    console.log('Applying filters:', {
      status,
      priority,
      assignedTo,
      createdAt,
      closedAt,
      resolvedAt
    });
    // You'll pass these filter values back to TicketList component
  };

  const handleClearAll = () => {
    // Reset all filters to default
    setStatus('any');
    setPriority('any');
    setAssignedTo('unassigned');
    setCreatedAt('any');
    setClosedAt('any');
    setResolvedAt('any');
  };

  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <h3>FILTERS</h3>
      </div>

      <div className="filter-section">
        <label className="filter-label">Status</label>
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
          className="filter-select"
        >
          <option value="any">Any status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-label">Priority</label>
        <select 
          value={priority} 
          onChange={(e) => setPriority(e.target.value)}
          className="filter-select"
        >
          <option value="any">Any priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-label">Assigned to</label>
        <div className="filter-input-group">
          <select 
            value={assignedTo} 
            onChange={(e) => setAssignedTo(e.target.value)}
            className="filter-select"
          >
            <option value="unassigned">Unassigned</option>
            <option value="any">Any user</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username || user.email}
              </option>
            ))}
          </select>
          {assignedTo !== 'any' && assignedTo !== 'unassigned' && (
            <button 
              className="clear-filter-btn"
              onClick={() => setAssignedTo('any')}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-label">Created at</label>
        <select 
          value={createdAt} 
          onChange={(e) => setCreatedAt(e.target.value)}
          className="filter-select"
        >
          <option value="any">Any time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7days">Last 7 days</option>
          <option value="last30days">Last 30 days</option>
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-label">Closed at</label>
        <select 
          value={closedAt} 
          onChange={(e) => setClosedAt(e.target.value)}
          className="filter-select"
        >
          <option value="any">Any time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7days">Last 7 days</option>
          <option value="last30days">Last 30 days</option>
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-label">Resolved at</label>
        <select 
          value={resolvedAt} 
          onChange={(e) => setResolvedAt(e.target.value)}
          className="filter-select"
        >
          <option value="any">Any time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7days">Last 7 days</option>
          <option value="last30days">Last 30 days</option>
        </select>
      </div>

      <button className="apply-btn" onClick={handleApply}>
        Apply
      </button>

      <button className="clear-all-btn" onClick={handleClearAll}>
        Clear all
      </button>
    </div>
  );
};

export default FilterSidebar;