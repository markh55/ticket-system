import { useNavigate, useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Sidebar from "../Dashboard/Sidebar/Sidebar";
import Topbar from "../Dashboard/Topbar/Topbar";
import "./TicketDetail.css";

const TicketDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [activeAction, setActiveAction] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [replyingToNoteId, setReplyingToNoteId] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [assignMessage, setAssignMessage] = useState("");

  // Email fields for reply/forward
  const [toEmail, setToEmail] = useState("");
  const [ccEmail, setCcEmail] = useState("");
  const [bccEmail, setBccEmail] = useState("");

  // Generate a color based on a string (name/email)
  const getAvatarColor = (str, isStaff) => {
    if (isStaff) return "#ffffff"; // white for staff

    const colors = [
      "#e53935", // red
      "#fb8c00", // orange
      "#43a047", // green
      "#00acc1", // cyan
      "#3949ab", // indigo
      "#8e24aa", // purple
      "#d81b60", // pink
      "#6d4c41", // brown
      "#00897b", // teal
      "#1e88e5", // blue
    ];
    if (!str) return colors[0];
    const charCode = str.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8000/api/user/", {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Current User:", data);
        setCurrentUser(data);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
      });

    fetch("http://localhost:8000/api/users/", {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Users:", data);
        setUsers(data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });

    fetch(`http://localhost:8000/api/tickets/${id}/`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setTicket(data);
      })
      .catch((error) => {
        console.error("Error fetching ticket:", error);
      });

    fetch(`http://localhost:8000/api/tickets/${id}/replies/`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Replies data:", data);
        if (Array.isArray(data)) {
          setReplies(data);
        } else if (data.results && Array.isArray(data.results)) {
          setReplies(data.results);
        } else {
          setReplies([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching replies:", error);
        setReplies([]);
      });
  }, [id]);

  // Reset and prefill email fields when action changes
  useEffect(() => {
    if (activeAction === "reply") {
      setToEmail(ticket?.sender || "");
      setCcEmail("");
      setBccEmail("");
    } else if (activeAction === "forward") {
      setToEmail("");
      setCcEmail("");
      setBccEmail("");
    }
  }, [activeAction, ticket]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleReplyToNote = (noteId) => {
    setReplyingToNoteId(noteId);
    setActiveAction(null);
    setReplyText("");
  };

  const handleAssignTicket = () => {
    const token = localStorage.getItem("token");

    if (!selectedAgent) {
      alert("Please select an agent");
      return;
    }

    fetch(`http://localhost:8000/api/tickets/${id}/assign/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent: selectedAgent,
      }),
    })
      .then((response) => {
        if (!response.ok)
          return response.json().then((err) => {
            throw err;
          });
        return response.json();
      })
      .then((data) => {
        setTicket(data);
        setActiveAction(null);
        setSelectedAgent("");
        setAssignMessage("");
        alert("Ticket assigned successfully");
      })
      .catch((error) => {
        console.error("Error assigning ticket:", error);
        alert("Failed to assign ticket");
      });
  };

  const handleSend = () => {
    const token = localStorage.getItem("token");

    if (!replyText || replyText.trim() === "") {
      alert("Please enter a message before sending.");
      return;
    }

    // Validate To field for reply/forward
    if (
      (activeAction === "reply" || activeAction === "forward") &&
      !toEmail.trim()
    ) {
      alert("Please enter a recipient email address.");
      return;
    }

    const payload = {
      body: replyText,
      is_staff_reply: true,
    };

    // Add email fields for reply/forward
    if (activeAction === "reply" || activeAction === "forward") {
      payload.to = toEmail;
      if (ccEmail.trim()) payload.cc = ccEmail;
      if (bccEmail.trim()) payload.bcc = bccEmail;
      if (activeAction === "forward") payload.is_forward = true;
    }

    if (activeAction === "note" || replyingToNoteId) {
      payload.is_internal = true;
    }

    fetch(`http://localhost:8000/api/tickets/${id}/replies/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok)
          return response.json().then((err) => {
            throw err;
          });
        return response.json();
      })
      .then((data) => {
        setReplies([...replies, data]);
        setReplyText("");
        setActiveAction(null);
        setReplyingToNoteId(null);
        setToEmail("");
        setCcEmail("");
        setBccEmail("");
      })
      .catch((error) => {
        console.error("Error sending reply:", error);
        const msg =
          (error &&
            (error.detail ||
              error.body ||
              error.non_field_errors ||
              JSON.stringify(error))) ||
          "Failed to send reply";
        alert(msg);
      });
  };

  const handleDeleteNote = (replyId) => {
    const token = localStorage.getItem("token");

    if (window.confirm("Are you sure you want to delete this note?")) {
      fetch(`http://localhost:8000/api/tickets/${id}/replies/${replyId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            setReplies(replies.filter((reply) => reply.id !== replyId));
          } else {
            return response.json().then((data) => {
              alert(data.error || "Failed to delete note");
            });
          }
        })
        .catch((error) => {
          console.error("Error deleting note:", error);
          alert("Error deleting note");
        });
    }
  };

  const handleCancelAction = () => {
    setActiveAction(null);
    setReplyText("");
    setToEmail("");
    setCcEmail("");
    setBccEmail("");
  };

  if (!ticket) {
    return <div>Loading...</div>;
  }

  return (
    <div className="ticket-detail-page">
      <Sidebar />
      <Topbar onLogout={handleLogout} />

      <div className="main-content">
        <div className="ticket-header">
          <h1>{ticket.subject}</h1>
        </div>

        <div className="conversation-thread-container">
          <div className="conversation-thread">
            {/* Original ticket message */}
            <div className="message-item">
              <div className="message-header">
                <div
                  className="sender-avatar"
                  style={{
                    backgroundColor: getAvatarColor(ticket.sender, false),
                  }}
                >
                  {ticket.sender?.charAt(0).toUpperCase() || "?"}
                </div>
                <strong>{ticket.sender}</strong>
                <span className="message-time">
                  {new Date(ticket.created_at).toLocaleString()}
                </span>
              </div>
              <div className="message-body">
                <p>{ticket.body}</p>
              </div>
            </div>

            {/* All replies */}
            {Array.isArray(replies) &&
              replies.map((reply) => {
                return (
                  <div key={reply.id}>
                    <div
                      className={`message-item ${
                        reply.is_staff_reply
                          ? "staff-message"
                          : "customer-message"
                      } ${reply.is_internal ? "internal-note" : ""}`}
                    >
                      <div className="message-header">
                        <div
                          className="sender-avatar"
                          style={{
                            backgroundColor: getAvatarColor(
                              reply.sender,
                              reply.is_staff_reply
                            ),
                            color: reply.is_staff_reply ? "#374151" : "#ffffff",
                            border: reply.is_staff_reply
                              ? "1px solid #9ca3af"
                              : "none",
                          }}
                        >
                          {reply.sender?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <strong>{reply.sender}</strong>
                        {reply.is_internal && (
                          <span className="note-badge">Internal Note</span>
                        )}
                        <span className="message-time">
                          {new Date(reply.created_at).toLocaleString()}
                        </span>
                        {reply.is_internal &&
                          currentUser &&
                          reply.created_by === currentUser.id && (
                            <button
                              className="delete-note-btn"
                              onClick={() => handleDeleteNote(reply.id)}
                            >
                              Delete
                            </button>
                          )}
                        {reply.is_internal && (
                          <button
                            className="reply-to-note-btn"
                            onClick={() => handleReplyToNote(reply.id)}
                          >
                            Reply to Note
                          </button>
                        )}
                      </div>
                      <div className="message-body">
                        <p>{reply.body}</p>
                      </div>
                    </div>

                    {/* Reply box appears right below this note */}
                    {replyingToNoteId === reply.id && (
                      <div className="reply-box inline-reply-box">
                        <textarea
                          placeholder="Reply to internal note..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        ></textarea>
                        <button onClick={handleSend}>Send</button>
                        <button
                          onClick={() => {
                            setReplyingToNoteId(null);
                            setReplyText("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        <div className="ticket-actions">
          <button onClick={() => setActiveAction("reply")}>Reply</button>
          <button onClick={() => setActiveAction("note")}>Add note</button>
          <button onClick={() => setActiveAction("forward")}>Forward</button>
          <button onClick={() => setActiveAction("assign")}>Assign</button>
        </div>

        {activeAction === "assign" && (
          <div className="reply-box">
            {ticket.assigned_to && (
              <p
                style={{
                  marginBottom: "12px",
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                Currently assigned to:{" "}
                <strong>{ticket.assigned_to.username}</strong>
              </p>
            )}
            <label>Assign to:</label>
            <select
              value={
                selectedAgent ||
                (ticket.assigned_to ? ticket.assigned_to.id : "")
              }
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              <option value="">Select an agent...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>

            <textarea
              placeholder="Add a message (optional)..."
              value={assignMessage}
              onChange={(e) => setAssignMessage(e.target.value)}
            ></textarea>

            <button onClick={handleAssignTicket}>Assign Ticket</button>
            <button
              onClick={() => {
                setActiveAction(null);
                setSelectedAgent("");
                setAssignMessage("");
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Reply Box with To, CC, BCC */}
        {activeAction === "reply" && (
          <div className="reply-box">
            <div className="email-field">
              <label>To:</label>
              <input
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder="Recipient email"
              />
            </div>
            <div className="email-field">
              <label>CC:</label>
              <input
                type="email"
                value={ccEmail}
                onChange={(e) => setCcEmail(e.target.value)}
                placeholder="CC recipients (optional)"
              />
            </div>
            <div className="email-field">
              <label>BCC:</label>
              <input
                type="email"
                value={bccEmail}
                onChange={(e) => setBccEmail(e.target.value)}
                placeholder="BCC recipients (optional)"
              />
            </div>
            <textarea
              placeholder="Enter your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            ></textarea>
            <div className="reply-box-actions">
              <button onClick={handleSend}>Send</button>
              <button onClick={handleCancelAction}>Cancel</button>
            </div>
          </div>
        )}

        {/* Forward Box with To, CC, BCC (not prefilled) */}
        {activeAction === "forward" && (
          <div className="reply-box">
            <div className="email-field">
              <label>To:</label>
              <input
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder="Recipient email"
              />
            </div>
            <div className="email-field">
              <label>CC:</label>
              <input
                type="email"
                value={ccEmail}
                onChange={(e) => setCcEmail(e.target.value)}
                placeholder="CC recipients (optional)"
              />
            </div>
            <div className="email-field">
              <label>BCC:</label>
              <input
                type="email"
                value={bccEmail}
                onChange={(e) => setBccEmail(e.target.value)}
                placeholder="BCC recipients (optional)"
              />
            </div>
            <textarea
              placeholder="Enter your message..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            ></textarea>
            <div className="reply-box-actions">
              <button onClick={handleSend}>Send</button>
              <button onClick={handleCancelAction}>Cancel</button>
            </div>
          </div>
        )}

        {/* Note Box (no email fields) */}
        {activeAction === "note" && (
          <div className="reply-box">
            <textarea
              placeholder="Enter your note..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            ></textarea>
            <div className="reply-box-actions">
              <button onClick={handleSend}>Send</button>
              <button onClick={handleCancelAction}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetail;
