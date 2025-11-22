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

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Get current user info
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

    // Fetch users list for assignment
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

    const payload = {
      body: replyText,
      is_staff_reply: true,
    };

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

        <div className="conversation-thread">
          <div className="message-card">
            <div className="message-header">
              <strong>{ticket.sender}</strong>
              <span className="message-time">
                {new Date(ticket.created_at).toLocaleString()}
              </span>
            </div>
            <div className="message-body">
              <p>{ticket.body}</p>
            </div>
          </div>

          {Array.isArray(replies) &&
            replies.map((reply) => {
              console.log(
                "Reply:",
                reply.id,
                "created_by:",
                reply.created_by,
                "currentUser:",
                currentUser?.id
              );
              return (
                <div key={reply.id}>
                  <div
                    className={`message-card ${
                      reply.is_staff_reply
                        ? "staff-message"
                        : "customer-message"
                    } ${reply.is_internal ? "internal-note" : ""}`}
                  >
                    <div className="message-header">
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

        {activeAction && activeAction !== "assign" && (
          <div className="reply-box">
            <textarea
              placeholder={`Enter your ${activeAction}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            ></textarea>
            <button onClick={handleSend}>Send</button>
            <button
              onClick={() => {
                setActiveAction(null);
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetail;
