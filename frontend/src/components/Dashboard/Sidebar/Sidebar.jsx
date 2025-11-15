import "./Sidebar.css";

export default function Sidebar() {
  return (
    <nav className="sidebar">
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
  );
}