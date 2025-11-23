import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../Dashboard/Sidebar/Sidebar";
import Topbar from "../Dashboard/Topbar/Topbar";
import "./Admin.css";

export default function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  // Export filters state
  const [exportFilters, setExportFilters] = useState({
    date_from: "",
    date_to: "",
    status: "",
    priority: "",
    assigned_to: "",
  });

  // Create User Form State
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "",
  });

  // Role Form State - FIXED: Now includes all permissions by default
  const [roleForm, setRoleForm] = useState({
    name: "",
    permissions: {
      view_tickets: false,
      create_tickets: false,
      edit_tickets: false,
      delete_tickets: false,
      assign_tickets: false,
      view_users: false,
      create_users: false,
      edit_users: false,
      delete_users: false,
      manage_roles: false,
      export_data: false,
    },
  });

  const getToken = () => localStorage.getItem("token");

  const fetchUsers = useCallback(() => {
    fetch("http://localhost:8000/api/admin/users/", {
      headers: {
        Authorization: `Token ${getToken()}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const fetchRoles = useCallback(() => {
    fetch("http://localhost:8000/api/admin/roles/", {
      headers: {
        Authorization: `Token ${getToken()}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Roles data from API:", data); // DEBUG
        setRoles(data);
      })
      .catch((err) => console.error("Error fetching roles:", err));
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const handleCreateUser = (e) => {
    e.preventDefault();
    fetch("http://localhost:8000/api/admin/users/create/", {
      method: "POST",
      headers: {
        Authorization: `Token ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    })
      .then((res) => {
        if (!res.ok)
          return res.json().then((err) => {
            throw err;
          });
        return res.json();
      })
      .then(() => {
        alert("User created successfully");
        setShowCreateUserModal(false);
        setNewUser({
          username: "",
          email: "",
          password: "",
          first_name: "",
          last_name: "",
          role: "",
        });
        fetchUsers();
      })
      .catch((err) => alert(err.error || "Failed to create user"));
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    fetch(`http://localhost:8000/api/admin/users/${selectedUser.id}/update/`, {
      method: "PUT",
      headers: {
        Authorization: `Token ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedUser),
    })
      .then((res) => {
        if (!res.ok)
          return res.json().then((err) => {
            throw err;
          });
        return res.json();
      })
      .then(() => {
        alert("User updated successfully");
        setShowEditUserModal(false);
        setSelectedUser(null);
        fetchUsers();
      })
      .catch((err) => alert(err.error || "Failed to update user"));
  };

  const handleDeleteUser = (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    fetch(`http://localhost:8000/api/admin/users/${userId}/delete/`, {
      method: "DELETE",
      headers: {
        Authorization: `Token ${getToken()}`,
      },
    })
      .then((res) => {
        if (!res.ok)
          return res.json().then((err) => {
            throw err;
          });
        return res.json();
      })
      .then(() => {
        alert("User deleted successfully");
        fetchUsers();
      })
      .catch((err) => alert(err.error || "Failed to delete user"));
  };

  const openExportModal = (dataType) => {
    setExportType(dataType);
    setShowExportModal(true);
  };

  const handleExportData = (e) => {
    e.preventDefault();

    const body = exportType === "tickets" ? exportFilters : {};

    fetch(`http://localhost:8000/api/admin/export/${exportType}/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${exportType}_export_${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setShowExportModal(false);
        setExportFilters({
          date_from: "",
          date_to: "",
          status: "",
          priority: "",
          assigned_to: "",
        });
      })
      .catch((err) => alert("Failed to export data"));
  };

  const handleCreateRole = (e) => {
    e.preventDefault();
    fetch("http://localhost:8000/api/admin/roles/create/", {
      method: "POST",
      headers: {
        Authorization: `Token ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roleForm),
    })
      .then((res) => {
        if (!res.ok)
          return res.json().then((err) => {
            throw err;
          });
        return res.json();
      })
      .then(() => {
        alert("Role created successfully");
        setShowRoleModal(false);
        setRoleForm({
          name: "",
          permissions: {
            view_tickets: false,
            create_tickets: false,
            edit_tickets: false,
            delete_tickets: false,
            assign_tickets: false,
            view_users: false,
            create_users: false,
            edit_users: false,
            delete_users: false,
            manage_roles: false,
            export_data: false,
          },
        });
        fetchRoles();
      })
      .catch((err) => alert(err.error || "Failed to create role"));
  };

  const handleUpdateRole = (e) => {
    e.preventDefault();
    fetch(`http://localhost:8000/api/admin/roles/${selectedRole.id}/update/`, {
      method: "PUT",
      headers: {
        Authorization: `Token ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roleForm),
    })
      .then((res) => {
        if (!res.ok)
          return res.json().then((err) => {
            throw err;
          });
        return res.json();
      })
      .then(() => {
        alert("Role updated successfully");
        setShowRoleModal(false);
        setSelectedRole(null);
        setRoleForm({
          name: "",
          permissions: {
            view_tickets: false,
            create_tickets: false,
            edit_tickets: false,
            delete_tickets: false,
            assign_tickets: false,
            view_users: false,
            create_users: false,
            edit_users: false,
            delete_users: false,
            manage_roles: false,
            export_data: false,
          },
        });
        fetchRoles();
      })
      .catch((err) => alert(err.error || "Failed to update role"));
  };

  const handleDeleteRole = (roleId) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    fetch(`http://localhost:8000/api/admin/roles/${roleId}/delete/`, {
      method: "DELETE",
      headers: {
        Authorization: `Token ${getToken()}`,
      },
    })
      .then((res) => {
        if (!res.ok)
          return res.json().then((err) => {
            throw err;
          });
        return res.json();
      })
      .then(() => {
        alert("Role deleted successfully");
        fetchRoles();
      })
      .catch((err) => alert(err.error || "Failed to delete role"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const openEditUserModal = (user) => {
    setSelectedUser({ ...user });
    setShowEditUserModal(true);
  };

  const openEditRoleModal = (role) => {
    setSelectedRole(role);
    setRoleForm({ name: role.name, permissions: role.permissions });
    setShowRoleModal(true);
  };

  const closeModals = () => {
    setShowCreateUserModal(false);
    setShowEditUserModal(false);
    setShowRoleModal(false);
    setShowExportModal(false);
    setSelectedUser(null);
    setSelectedRole(null);
    setExportType("");
    setNewUser({
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      role: "",
    });
    setRoleForm({
      name: "",
      permissions: {
        view_tickets: false,
        create_tickets: false,
        edit_tickets: false,
        delete_tickets: false,
        assign_tickets: false,
        view_users: false,
        create_users: false,
        edit_users: false,
        delete_users: false,
        manage_roles: false,
        export_data: false,
      },
    });
    setExportFilters({
      date_from: "",
      date_to: "",
      status: "",
      priority: "",
      assigned_to: "",
    });
  };

  return (
    <div className="admin-page">
      <Sidebar />
      <Topbar onLogout={handleLogout} />

      <div className="main-content">
        <div className="admin-container">
          <h1>Administration</h1>

          {/* Create User Section */}
          <div className="settings-card">
            <h2>Create User</h2>
            <p className="section-description">Add new users to the system</p>
            <button
              className="save-button"
              onClick={() => setShowCreateUserModal(true)}
            >
              Create New User
            </button>
          </div>

          {/* Manage Users Section */}
          <div className="settings-card">
            <h2>Manage Users</h2>
            <p className="section-description">
              View and manage all system users
            </p>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        {user.first_name} {user.last_name}
                      </td>
                      <td>{user.role || "N/A"}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            user.is_active ? "active" : "inactive"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => openEditUserModal(user)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Export Data Section */}
          <div className="settings-card">
            <h2>Export Data</h2>
            <p className="section-description">
              Download system data in CSV format
            </p>
            <div className="export-buttons">
              <button
                className="save-button"
                onClick={() => openExportModal("users")}
              >
                Export Users
              </button>
              <button
                className="save-button"
                onClick={() => openExportModal("tickets")}
              >
                Export Tickets
              </button>
              <button
                className="save-button"
                onClick={() => openExportModal("all")}
              >
                Export All Data
              </button>
            </div>
          </div>

          {/* Manage Roles & Permissions Section */}
          <div className="settings-card">
            <h2>Manage Roles & Permissions</h2>
            <p className="section-description">
              Create and manage user roles with specific permissions
            </p>
            <button
              className="save-button"
              onClick={() => setShowRoleModal(true)}
              style={{ marginBottom: "20px" }}
            >
              Create New Role
            </button>

            <div className="roles-list">
              {roles.map((role) => {
                // Handle permissions - could be object, string, or null
                let permissions = role.permissions;
                if (typeof permissions === "string") {
                  try {
                    permissions = JSON.parse(permissions);
                  } catch (e) {
                    permissions = {};
                  }
                }
                if (!permissions || typeof permissions !== "object") {
                  permissions = {};
                }

                const enabledCount = Object.keys(permissions).filter(
                  (k) => permissions[k] === true
                ).length;

                return (
                  <div key={role.id} className="role-item">
                    <div className="role-info">
                      <h3>{role.name}</h3>
                      <p>{enabledCount} permissions enabled</p>
                    </div>
                    <div className="role-actions">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => openEditRoleModal(role)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="modal-overlay" onClick={closeModals}>
          <div
            className="modal-content-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Create New User</h2>
              <button className="modal-close" onClick={closeModals}>
                ×
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="form-row">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={newUser.username}
                    onChange={(e) =>
                      setNewUser({ ...newUser, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    value={newUser.first_name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, first_name: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={newUser.last_name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, last_name: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  required
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModals}
                >
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className="modal-overlay" onClick={closeModals}>
          <div
            className="modal-content-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Edit User</h2>
              <button className="modal-close" onClick={closeModals}>
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="form-row">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={selectedUser.username}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        username: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={selectedUser.first_name || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        first_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={selectedUser.last_name || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        last_name: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={selectedUser.role || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, role: e.target.value })
                  }
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedUser.is_active}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        is_active: e.target.checked,
                      })
                    }
                  />
                  <span>Active Account</span>
                </label>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModals}
                >
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Modal (Create/Edit) */}
      {showRoleModal && (
        <div className="modal-overlay" onClick={closeModals}>
          <div
            className="modal-content-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{selectedRole ? "Edit Role" : "Create New Role"}</h2>
              <button className="modal-close" onClick={closeModals}>
                ×
              </button>
            </div>
            <form onSubmit={selectedRole ? handleUpdateRole : handleCreateRole}>
              <div className="form-group">
                <label>Role Name</label>
                <input
                  type="text"
                  placeholder="Enter role name"
                  value={roleForm.name}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Permissions</label>
                <div className="permissions-grid">
                  {Object.keys(roleForm.permissions).map((permission) => (
                    <div key={permission} className="notification-toggle">
                      <label>
                        <input
                          type="checkbox"
                          checked={roleForm.permissions[permission]}
                          onChange={(e) =>
                            setRoleForm({
                              ...roleForm,
                              permissions: {
                                ...roleForm.permissions,
                                [permission]: e.target.checked,
                              },
                            })
                          }
                        />
                        <span>
                          {permission
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModals}
                >
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  {selectedRole ? "Update Role" : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={closeModals}>
          <div
            className="modal-content-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                Export{" "}
                {exportType.charAt(0).toUpperCase() + exportType.slice(1)}
              </h2>
              <button className="modal-close" onClick={closeModals}>
                ×
              </button>
            </div>
            <form onSubmit={handleExportData}>
              {exportType === "tickets" && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date From</label>
                      <input
                        type="date"
                        value={exportFilters.date_from}
                        onChange={(e) =>
                          setExportFilters({
                            ...exportFilters,
                            date_from: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Date To</label>
                      <input
                        type="date"
                        value={exportFilters.date_to}
                        onChange={(e) =>
                          setExportFilters({
                            ...exportFilters,
                            date_to: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={exportFilters.status}
                        onChange={(e) =>
                          setExportFilters({
                            ...exportFilters,
                            status: e.target.value,
                          })
                        }
                      >
                        <option value="">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Priority</label>
                      <select
                        value={exportFilters.priority}
                        onChange={(e) =>
                          setExportFilters({
                            ...exportFilters,
                            priority: e.target.value,
                          })
                        }
                      >
                        <option value="">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Assigned To</label>
                    <select
                      value={exportFilters.assigned_to}
                      onChange={(e) =>
                        setExportFilters({
                          ...exportFilters,
                          assigned_to: e.target.value,
                        })
                      }
                    >
                      <option value="">All Users</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              {exportType === "users" && (
                <p className="section-description">
                  All users will be exported to CSV format.
                </p>
              )}
              {exportType === "all" && (
                <p className="section-description">
                  All system data will be exported to CSV format.
                </p>
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModals}
                >
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  Export Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
