import { useState } from "react";
import "./Sidebar.css";

export default function Sidebar({ className }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
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
          <div className="nav-item">
            <span className="icon">🎟️ </span>
            <span>Tickets</span>
          </div>
          <div className="nav-item">
            <span className="icon">📅 </span>
            <span>Calendar</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">👤</div>
            <div className="user-info">
              <p className="username"></p>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}