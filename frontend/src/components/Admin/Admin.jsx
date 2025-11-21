import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Sidebar from "../Dashboard/Sidebar/Sidebar";
import Topbar from "../Dashboard/Topbar/Topbar";
import "./Admin.css";

export default function Admin() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="admin-page">
      <Sidebar />
      <div className="main-content">
        <Topbar onLogout={handleLogout} />
        <div className="admin-container">
          <h1>Administration</h1>
        </div>
      </div>
    </div>
  );
}