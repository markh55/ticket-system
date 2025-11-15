import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Sidebar from "./Sidebar/Sidebar";
import Topbar from "./Topbar/Topbar";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <Topbar onLogout={handleLogout} />
    </div>
  );
}