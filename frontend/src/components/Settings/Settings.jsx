import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Sidebar from "../Dashboard/Sidebar/Sidebar";
import Topbar from "../Dashboard/Topbar/Topbar";
import "./Settings.css";

const Settings = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [signature, setSignature] = useState("");

  const [emailNotifications, setEmailNotifications] = useState({
    newTicket: true,
    ticketUpdate: true,
    ticketClosed: false,
  });
  const [inAppNotifications, setInAppNotifications] = useState({
    newTicket: true,
    ticketUpdate: true,
    ticketClosed: true,
  });

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/user/`,
      {
        headers: {
          Authorization: `Token ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setCurrentUser(data);
        setEmail(data.email || "");
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setSignature(data.signature || "");
        if (data.email_notifications)
          setEmailNotifications(data.email_notifications);
        if (data.in_app_notifications)
          setInAppNotifications(data.in_app_notifications);
      })
      .catch((err) => console.error("Error fetching user:", err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    fetch(
      `${
        process.env.REACT_APP_API_URL || "http://localhost:8000"
      }/api/change-password/`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_password: currentPassword,
          new_password: newPassword,
        }),
      }
    )
      .then((res) => {
        if (!res.ok)
          return res.json().then((err) => {
            throw err;
          });
        return res.json();
      })
      .then(() => {
        alert("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordModal(false);
      })
      .catch((err) => {
        alert(
          err.old_password || err.new_password || "Failed to change password"
        );
      });
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();

    fetch(
      `${
        process.env.REACT_APP_API_URL || "http://localhost:8000"
      }/api/user/update/`,
      {
        method: "PUT",
        headers: {
          Authorization: `Token ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: lastName,
        }),
      }
    )
      .then((res) => {
        if (!res.ok)
          return res.json().then((err) => {
            throw err;
          });
        return res.json();
      })
      .then((data) => {
        alert("Profile updated successfully");
        setCurrentUser(data);
      })
      .catch(() => alert("Failed to update profile"));
  };

  const handleSaveSignature = () => {
    fetch(
      `${
        process.env.REACT_APP_API_URL || "http://localhost:8000"
      }/api/user/signature/`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ signature }),
      }
    )
      .then((res) => {
        if (!res.ok)
          return res.json().then((err) => {
            throw err;
          });
        return res.json();
      })
      .then(() => alert("Signature saved successfully"))
      .catch(() => alert("Failed to save signature"));
  };

  const handleSaveNotifications = () => {
    fetch(
      `${
        process.env.REACT_APP_API_URL || "http://localhost:8000"
      }/api/user/notifications/`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_notifications: emailNotifications,
          in_app_notifications: inAppNotifications,
        }),
      }
    )
      .then((res) => {
        if (!res.ok)
          return res.json().then((err) => {
            throw err;
          });
        return res.json();
      })
      .then(() => alert("Notification preferences saved successfully"))
      .catch(() => alert("Failed to save notification preferences"));
  };

  const closeModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="settings-page">
      <Sidebar />
      <Topbar onLogout={handleLogout} />

      <div className="main-content">
        <div className="settings-container">
          <div className="account-details-card">
            <div className="profile-picture-section">
              <div className="profile-avatar">
                {currentUser?.username?.charAt(0).toUpperCase() || "?"}
              </div>
            </div>

            <div className="account-details-content">
              <h2>Account Details</h2>
              {currentUser ? (
                <>
                  <div className="detail-item">
                    <label>Username</label>
                    <p>{currentUser.username}</p>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <p>{currentUser.email}</p>
                  </div>
                  <div className="detail-item">
                    <label>Account Status</label>
                    <span className="status-badge">Active</span>
                  </div>
                  <button
                    className="change-password-link"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change Password
                  </button>
                </>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>

          <div className="profile-sections">
            <div className="profile-info-card">
              <h2>Profile Information</h2>
              <form onSubmit={handleProfileUpdate}>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button type="submit" className="save-button">
                  Save Changes
                </button>
              </form>
            </div>

            <div className="settings-card">
              <h2>Email Signature</h2>
              <div className="form-group">
                <label>
                  Your signature will be automatically added to ticket replies
                </label>
                <textarea
                  className="signature-textarea"
                  rows="4"
                  placeholder="Best regards,&#10;Your Name&#10;Support Team"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                />
              </div>
              <button className="save-button" onClick={handleSaveSignature}>
                Save Signature
              </button>
            </div>

            <div className="settings-card">
              <h2>Notifications</h2>
              <div className="notification-section">
                <h3>Email Notifications</h3>
                <div className="notification-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={emailNotifications.newTicket}
                      onChange={(e) =>
                        setEmailNotifications({
                          ...emailNotifications,
                          newTicket: e.target.checked,
                        })
                      }
                    />
                    <span>New ticket assigned to me</span>
                  </label>
                </div>
                <div className="notification-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={emailNotifications.ticketUpdate}
                      onChange={(e) =>
                        setEmailNotifications({
                          ...emailNotifications,
                          ticketUpdate: e.target.checked,
                        })
                      }
                    />
                    <span>Ticket updates and replies</span>
                  </label>
                </div>
                <div className="notification-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={emailNotifications.ticketClosed}
                      onChange={(e) =>
                        setEmailNotifications({
                          ...emailNotifications,
                          ticketClosed: e.target.checked,
                        })
                      }
                    />
                    <span>Ticket closed</span>
                  </label>
                </div>
              </div>

              <div className="notification-section">
                <h3>In-App Notifications</h3>
                <div className="notification-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={inAppNotifications.newTicket}
                      onChange={(e) =>
                        setInAppNotifications({
                          ...inAppNotifications,
                          newTicket: e.target.checked,
                        })
                      }
                    />
                    <span>New ticket assigned to me</span>
                  </label>
                </div>
                <div className="notification-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={inAppNotifications.ticketUpdate}
                      onChange={(e) =>
                        setInAppNotifications({
                          ...inAppNotifications,
                          ticketUpdate: e.target.checked,
                        })
                      }
                    />
                    <span>Ticket updates and replies</span>
                  </label>
                </div>
                <div className="notification-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={inAppNotifications.ticketClosed}
                      onChange={(e) =>
                        setInAppNotifications({
                          ...inAppNotifications,
                          ticketClosed: e.target.checked,
                        })
                      }
                    />
                    <span>Ticket closed</span>
                  </label>
                </div>
              </div>
              <button className="save-button" onClick={handleSaveNotifications}>
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Change Password</h2>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
