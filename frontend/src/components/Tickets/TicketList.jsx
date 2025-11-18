import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../Dashboard/Sidebar/Sidebar';
import Topbar from '../Dashboard/Topbar/Topbar';
import FilterSidebar from './FilterSidebar';
import './TicketList.css';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [sortBy, setSortBy] = useState('date-desc');
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    assignee: []
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:8000/api/tickets/', {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(data => {
        const ticketData = Array.isArray(data) ? data : (data.results || []);
        setTickets(ticketData);
        setFilteredTickets(ticketData);
        console.log('Tickets loaded:', ticketData);
      })
      .catch(error => {
        console.error('Error fetching tickets:', error);
      });
  }, []);

  // Apply URL filter on load
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam && tickets.length > 0) {
      const newFilters = {
        status: [],
        priority: [],
        assignee: []
      };

      switch (filterParam) {
        case 'open':
          newFilters.status = ['open'];
          break;
        case 'closed':
          newFilters.status = ['closed'];
          break;
        case 'unassigned':
          newFilters.assignee = ['unassigned'];
          break;
        case 'high_priority':
          newFilters.priority = ['high'];
          break;
        case 'all':
        default:
          // Show all tickets
          break;
      }

      setFilters(newFilters);
    }
  }, [searchParams, tickets]);

  // Apply filters whenever tickets or filters change
  useEffect(() => {
    let filtered = [...tickets];

    // Filter by status
    if (filters.status.length > 0) {
      filtered = filtered.filter(ticket => 
        filters.status.includes(ticket.status)
      );
    }

    // Filter by priority
    if (filters.priority.length > 0) {
      filtered = filtered.filter(ticket => 
        filters.priority.includes(ticket.priority)
      );
    }

    // Filter by assignee
    if (filters.assignee.length > 0) {
      filtered = filtered.filter(ticket => {
        if (filters.assignee.includes('unassigned')) {
          return !ticket.assigned_to;
        }
        // Check if the ticket's assigned user matches any filter (by username or email)
        return ticket.assigned_to && 
               (filters.assignee.includes(ticket.assigned_to.username) || 
                filters.assignee.includes(ticket.assigned_to.email));
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'date-asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'priority-high':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'priority-low':
          const priorityOrderLow = { high: 3, medium: 2, low: 1 };
          return (priorityOrderLow[a.priority] || 0) - (priorityOrderLow[b.priority] || 0);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'subject':
          return a.subject.localeCompare(b.subject);
        default:
          return 0;
      }
    });

    setFilteredTickets(sorted);
  }, [tickets, filters, sortBy]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const currentFilters = prev[filterType];
      const newFilters = currentFilters.includes(value)
        ? currentFilters.filter(item => item !== value)
        : [...currentFilters, value];
      
      return {
        ...prev,
        [filterType]: newFilters
      };
    });
  };

  const handleApplyFilters = (filtersToApply, users) => {
    const newFilters = {
      status: [],
      priority: [],
      assignee: []
    };

    // Add status filter
    if (filtersToApply.status) {
      newFilters.status.push(filtersToApply.status);
    }

    // Add priority filter
    if (filtersToApply.priority) {
      newFilters.priority.push(filtersToApply.priority);
    }

    // Add assignee filter
    if (filtersToApply.assignedTo) {
      if (filtersToApply.assignedTo === 'unassigned') {
        newFilters.assignee.push('unassigned');
      } else {
        const user = users.find(u => u.id.toString() === filtersToApply.assignedTo);
        if (user) {
          newFilters.assignee.push(user.username || user.email);
        }
      }
    }

    setFilters(newFilters);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTickets(filteredTickets.map(ticket => ticket.id));
    } else {
      setSelectedTickets([]);
    }
  };

  const handleSelectTicket = (ticketId) => {
    setSelectedTickets(prev => {
      if (prev.includes(ticketId)) {
        return prev.filter(id => id !== ticketId);
      } else {
        return [...prev, ticketId];
      }
    });
  };

  const isAllSelected = filteredTickets.length > 0 && selectedTickets.length === filteredTickets.length;

  const handleDeleteSelected = () => {
    if (selectedTickets.length === 0) return;
    
    const token = localStorage.getItem('token');
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedTickets.length} ticket(s)?`);
    
    if (!confirmDelete) return;

    // Delete each selected ticket
    Promise.all(
      selectedTickets.map(ticketId =>
        fetch(`http://localhost:8000/api/tickets/${ticketId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          }
        })
      )
    )
    .then(() => {
      // Remove deleted tickets from state
      setTickets(prev => prev.filter(ticket => !selectedTickets.includes(ticket.id)));
      setSelectedTickets([]);
      console.log('Tickets deleted successfully');
    })
    .catch(error => {
      console.error('Error deleting tickets:', error);
      alert('Error deleting tickets. Please try again.');
    });
  };

  const handleSort = (sortValue) => {
    setSortBy(sortValue);
  };

  const handleRowClick = (ticketId) => {
    navigate(`/tickets/${ticketId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    return status === 'open' ? 'First response due' : 'Closed';
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <Topbar onLogout={handleLogout} />
      
      <div className="main-content">
        <div className="content-wrapper">
          
          <div className="ticket-list">
            <div className="ticket-list-header">
              <h2>New tickets <span className="ticket-count">{filteredTickets.length}</span></h2>
              <div className="ticket-actions">
                {selectedTickets.length > 0 && (
                  <button 
                    className="delete-selected-btn"
                    onClick={handleDeleteSelected}
                    style={{
                      marginRight: '15px',
                      padding: '8px 16px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Delete ({selectedTickets.length})
                  </button>
                )}
                <span className="ticket-pagination">1 - {filteredTickets.length} of {filteredTickets.length}</span>
              </div>
            </div>

            <div className="ticket-table-container">
              <table className="ticket-table">
                <thead>
                  <tr>
                    <th>
                      <input 
                        type="checkbox" 
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Contact</th>
                    <th>Subject</th>
                    <th>State</th>
                    <th>Group</th>
                    <th>Agent</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(ticket => (
                    <tr 
                      key={ticket.id} 
                      className="ticket-row"
                      onClick={() => handleRowClick(ticket.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={selectedTickets.includes(ticket.id)}
                          onChange={() => handleSelectTicket(ticket.id)}
                        />
                      </td>
                      <td className="ticket-contact">
                        <div className="contact-avatar">
                          {ticket.sender.charAt(0).toUpperCase()}
                        </div>
                        <span>{ticket.sender}</span>
                      </td>
                      <td className="ticket-subject">{ticket.subject}</td>
                      <td>
                        <span className={`status-badge ${ticket.status}`}>
                          {getStatusBadge(ticket.status)}
                        </span>
                      </td>
                      <td className="ticket-group">--</td>
                      <td className="ticket-agent">
                        {ticket.assigned_to ? ticket.assigned_to.username : '--'}
                      </td>
                      <td>
                        <span className={`priority-badge priority-${ticket.priority}`}>
                          {ticket.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <FilterSidebar 
            filters={filters}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onSort={handleSort}
            tickets={tickets}
          />
        </div>
      </div>
    </div>
  );
};

export default TicketList;