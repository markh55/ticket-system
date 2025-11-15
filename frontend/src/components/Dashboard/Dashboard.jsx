import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Sidebar from "./Sidebar/Sidebar";
import Topbar from "./Topbar/Topbar";
import Tiles from "./Tiles/Tiles";

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
    <div className="tiles-container">
      <Tiles title="Total" count={150} />
      <Tiles title="In Progress" count={25} />
      <Tiles title="Completed" count={50} />
    </div>
    </div>
  );
}
