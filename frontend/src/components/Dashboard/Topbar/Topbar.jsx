import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../../api";
import "./Topbar.css";
import {
  LayoutDashboard,
  Ticket,
  CalendarDays,
  Settings,
  NotebookPen,
  Menu,
  LogOut,
} from "lucide-react";

export default function Topbar({ onLogout }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [username, setUsername] = useState("");
  const [isSuperuser, setIsSuperuser] = useState(false);

  const searchRef = useRef(null);
  const hamburgerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await getCurrentUser(token);
          setUsername(userData.username);
          setIsSuperuser(userData.is_superuser);
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target) &&
        !event.target.closest(".mobile-hamburger-dropdown")
      ) {
        setShowMobileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    const token = localStorage.getItem("token");

    fetch(
      `${
        process.env.REACT_APP_API_URL ||
        "https://ticket-system-dakb.onrender.com"
      }/api/tickets/`,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        const tickets = Array.isArray(data) ? data : data.results || [];
        const query = searchQuery.toLowerCase();

        const filtered = tickets.filter(
          (ticket) =>
            ticket.subject.toLowerCase().includes(query) ||
            ticket.sender.toLowerCase().includes(query) ||
            ticket.body.toLowerCase().includes(query)
        );

        setSearchResults(filtered);
        setShowResults(true);
        setIsSearching(false);
      })
      .catch((error) => {
        console.error("Search error:", error);
        setIsSearching(false);
      });
  }, [searchQuery]);

  const handleResultClick = (ticketId) => {
    navigate(`/tickets/${ticketId}`);
    setSearchQuery("");
    setShowResults(false);
  };

  const handleMobileNavClick = (route) => {
    navigate(route);
    setShowMobileMenu(false);
  };

  return (
    <div className={`topbar ${showMobileMenu ? "expanded" : ""}`}>
      <div className="topbar-main-row">
        <div className="search-container" ref={searchRef}>
          <svg
            className="search-icon"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 14L10.5 10.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
                searchResults.map((ticket) => (
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

        <div className="mobile-hamburger">
          <button
            className="mobile-hamburger-btn"
            ref={hamburgerRef}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu size={20} />
          </button>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      {showMobileMenu && (
        <div className="mobile-hamburger-dropdown">
          <div className="mobile-hamburger-header">
            <div className="mobile-hamburger-avatar">
              {username ? username.charAt(0).toUpperCase() : "?"}
            </div>
            <p className="mobile-hamburger-username">
              {username || "Loading..."}
            </p>
          </div>

          <div className="mobile-hamburger-items">
            <div
              className={`mobile-hamburger-item ${
                location.pathname === "/dashboard" ? "active" : ""
              }`}
              onClick={() => handleMobileNavClick("/dashboard")}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </div>

            <div
              className={`mobile-hamburger-item ${
                location.pathname === "/tickets" ? "active" : ""
              }`}
              onClick={() => handleMobileNavClick("/tickets")}
            >
              <Ticket size={18} />
              <span>Tickets</span>
            </div>

            <div
              className={`mobile-hamburger-item ${
                location.pathname === "/calendar" ? "active" : ""
              }`}
              onClick={() => handleMobileNavClick("/calendar")}
            >
              <CalendarDays size={18} />
              <span>Calendar</span>
            </div>

            {isSuperuser && (
              <div
                className={`mobile-hamburger-item ${
                  location.pathname.startsWith("/admin") ? "active" : ""
                }`}
                onClick={() => handleMobileNavClick("/admin")}
              >
                <NotebookPen size={18} />
                <span>Administration</span>
              </div>
            )}

            <div
              className={`mobile-hamburger-item ${
                location.pathname === "/settings" ? "active" : ""
              }`}
              onClick={() => handleMobileNavClick("/settings")}
            >
              <Settings size={18} />
              <span>Settings</span>
            </div>

            <div className="mobile-hamburger-divider"></div>

            <div className="mobile-hamburger-item logout" onClick={onLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
