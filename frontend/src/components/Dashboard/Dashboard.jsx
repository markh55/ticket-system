import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Sidebar from "../Sidebar/Sidebar";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

return (
  <div className="dashboard-container">
    <Sidebar />
    
    <div className="main-content">
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
      <p>Welcome to your dashboard!</p>
    </div>
  </div>
);
}