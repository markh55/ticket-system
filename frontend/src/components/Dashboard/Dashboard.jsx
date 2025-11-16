import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Dashboard.css";
import Sidebar from "./Sidebar/Sidebar";
import Topbar from "./Topbar/Topbar";
import Tiles from "./Tiles/Tiles";
import Graph from "./Tiles/Graph";
import Recents from "./Tiles/Recents";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    in_progress: 0,
    completed: 0
  });
  const [chartData, setChartData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json"
        };

        const statsResponse = await fetch("http://127.0.0.1:8000/api/tickets/stats/", { headers });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        const chartResponse = await fetch("http://127.0.0.1:8000/api/tickets/chart_data/", { headers });
        if (chartResponse.ok) {
          const chartData = await chartResponse.json();
          setChartData(chartData);
        }

        const activityResponse = await fetch("http://127.0.0.1:8000/api/tickets/recent_activity/", { headers });
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setRecentActivity(activityData);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleTileClick = (filter) => {
    navigate(`/tickets?filter=${filter}`);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <Topbar onLogout={handleLogout} />
      
      <div className="main-content">
        <div className="tiles-container">
          <Tiles 
            title="Total" 
            count={loading ? "..." : stats.total} 
            variant="small"
            onClick={() => handleTileClick('all')}
          />
          <Tiles 
            title="In Progress" 
            count={loading ? "..." : stats.in_progress} 
            variant="small"
            onClick={() => handleTileClick('open')}
          />
          <Tiles 
            title="Completed" 
            count={loading ? "..." : stats.completed} 
            variant="small"
            onClick={() => handleTileClick('closed')}
          />
        </div>

        <div className="tiles-container">
          <div className="tile tile-large">
            <Graph data={chartData} />
          </div>
          <div className="tile tile-medium">
            <Recents activities={recentActivity} />
          </div>
        </div>
      </div>
    </div>
  );
}