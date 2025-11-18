import React, { useState, useEffect } from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({ filters, onFilterChange, tickets, onSort, onApplyFilters }) => {
  const [status, setStatus] = useState('any');
  const [priority, setPriority] = useState('any');
  const [assignedTo, setAssignedTo] = useState('any');
  const [createdAt, setCreatedAt] = useState('any');
  const [closedAt, setClosedAt] = useState('any');
  const [resolvedAt, setResolvedAt] = useState('any');
  const [sortBy, setSortBy] = useState('date-desc');
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

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setStatus(value);
    
    if (onApplyFilters) {
      onApplyFilters({ status: value !== 'any' ? value : null, priority: priority !== 'any' ? priority : null, assignedTo: assignedTo !== 'any' ? assignedTo : null }, users);
    }
  };

  const handlePriorityChange = (e) => {
    const value = e.target.value;
    setPriority(value);
    
    if (onApplyFilters) {
      onApplyFilters({ status: status !== 'any' ? status : null, priority: value !== 'any' ? value : null, assignedTo: assignedTo !== 'any' ? assignedTo : null }, users);
    }
  };

  const handleAssignedToChange = (e) => {
    const value = e.target.value;
    setAssignedTo(value);
    
    if (onApplyFilters) {
      onApplyFilters({ status: status !== 'any' ? status : null, priority: priority !== 'any' ? priority : null, assignedTo: value !== 'any' ? value : null }, users);
    }
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    if (onSort) {
      onSort(value);
    }
  };

  const handleClearAll = () => {
    // Reset local state
    setStatus('any');
    setPriority('any');
    setAssignedTo('any');
    setCreatedAt('any');
    setClosedAt('any');
    setResolvedAt('any');
    
    // Clear filters in parent
    if (onApplyFilters) {
      onApplyFilters({ status: null, priority: null, assignedTo: null }, users);
    }
  };

  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <h3>FILTERS</h3>
      </div>

      <div className="filter-section">
        <label className="filter-label">Sort by</label>
        <select 
          value={sortBy} 
          onChange={handleSortChange}
          className="filter-select"
        >
          <option value="date-desc">Date created (newest)</option>
          <option value="date-asc">Date created (oldest)</option>
          <option value="priority-high">Priority (high to low)</option>
          <option value="priority-low">Priority (low to high)</option>
          <option value="status">Status</option>
          <option value="subject">Subject (A-Z)</option>
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-label">Status</label>
        <select 
          value={status} 
          onChange={handleStatusChange}
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
          onChange={handlePriorityChange}
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
            onChange={handleAssignedToChange}
            className="filter-select"
          >
            <option value="any">Any Agent</option>
            <option value="unassigned">Unassigned</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username || user.email}
              </option>
            ))}
          </select>
          {assignedTo !== 'any' && (
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

      <button className="clear-all-btn" onClick={handleClearAll}>
        Clear all
      </button>
    </div>
  );
};

export default FilterSidebar;