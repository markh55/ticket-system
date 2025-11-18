import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Topbar.css";

export default function Topbar({ onLogout }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search tickets
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    const token = localStorage.getItem('token');

    fetch(`http://localhost:8000/api/tickets/`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(data => {
        const tickets = Array.isArray(data) ? data : (data.results || []);
        const query = searchQuery.toLowerCase();
        
        const filtered = tickets.filter(ticket => 
          ticket.subject.toLowerCase().includes(query) ||
          ticket.sender.toLowerCase().includes(query) ||
          ticket.body.toLowerCase().includes(query)
        );

        setSearchResults(filtered);
        setShowResults(true);
        setIsSearching(false);
      })
      .catch(error => {
        console.error('Search error:', error);
        setIsSearching(false);
      });
  }, [searchQuery]);

  const handleResultClick = (ticketId) => {
    navigate(`/tickets/${ticketId}`);
    setSearchQuery("");
    setShowResults(false);
  };

  return (
    <div className="topbar">
      <div className="search-container" ref={searchRef}>
        <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 14L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <input 
          type="text" 
          placeholder="Search tickets..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {showResults && (
          <div className="search-results-dropdown">
            {isSearching ? (
              <div className="search-result-item">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map(ticket => (
                <div 
                  key={ticket.id}
                  className="search-result-item"
                  onClick={() => handleResultClick(ticket.id)}
                >
                  <div className="result-subject">{ticket.subject}</div>
                  <div className="result-meta">
                    <span>{ticket.sender}</span>
                    <span className={`result-status ${ticket.status}`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="search-result-item">No tickets found</div>
            )}
          </div>
        )}
      </div>
      
      <button className="logout-btn" onClick={onLogout}>Logout</button>
    </div>
  );
}