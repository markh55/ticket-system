import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../../api";
import "./Sidebar.css";
import { LayoutDashboard, Ticket, CalendarDays, Settings, NotebookPen } from "lucide-react";

export default function Sidebar({ className }) {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await getCurrentUser(token);
          setUsername(userData.username);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
    };
    
    fetchUser();
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNavClick = (route) => {
    navigate(route);
    setIsOpen(false);
  };

  return (
    <>
      <button 
        className={`mobile-menu-toggle ${isOpen ? 'active' : ''}`} 
        onClick={toggleSidebar}>
      </button>
      
      {isOpen && (
        <div 
          className="sidebar-overlay active"
          onClick={toggleSidebar}
        ></div>
      )}

      <nav className={`sidebar ${className || ''} ${isOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <h2>Code By Mark</h2>
          </div>
        </div>

        <div className="sidebar-nav">
          <div 
            className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('/dashboard')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleNavClick('/dashboard')}
          >
            <span className="icon"><LayoutDashboard size={20} /></span>
            <span>Dashboard</span>
          </div>
          <div 
            className={`nav-item ${location.pathname === '/tickets' ? 'active' : ''}`}
            onClick={() => handleNavClick('/tickets')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleNavClick('/tickets')}
          >
            <span className="icon"><Ticket size={20} /></span>
            <span>Tickets</span>
          </div>
          <div 
            className={`nav-item ${location.pathname === '/calendar' ? 'active' : ''}`}
            onClick={() => handleNavClick('/calendar')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleNavClick('/calendar')}
          >
            <span className="icon"><CalendarDays size={20} /></span>
            <span>Calendar</span>
          </div>

          <div
            className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
            onClick={() => handleNavClick('/settings')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleNavClick('/settings')}
            style={{ marginTop: 'auto' }}
          >
            <span className="icon"><Settings size={20} /></span>
            <span>Settings</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">👤</div>
            <div className="user-info">
              <p className="username">{username || 'Loading...'}</p>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}