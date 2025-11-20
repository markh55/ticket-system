import "./Recents.css";

export default function Recents({ activities, onActivityClick }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleClick = (activity) => {
    if (onActivityClick && activity.ticket_id) {
      onActivityClick(activity.ticket_id);
    }
  };

  return (
    <div className="recents-container">
      <h3>Recent Activity</h3>
      {activities && activities.length > 0 ? (
        <div className="activity-list">
          {activities.map((activity, index) => (
            <div 
              key={index} 
              className={`activity-item ${activity.type}`}
              onClick={() => handleClick(activity)}
              style={{ cursor: 'pointer' }}
            >
              {activity.type === 'ticket' ? (
                <>
                  <div className="activity-type">
                    <span className="badge ticket-badge">Ticket</span>
                    <span className={`status-badge ${activity.status}`}>{activity.status}</span>
                  </div>
                  <div className="activity-content">
                    <p className="activity-subject">{activity.subject}</p>
                    <p className="activity-sender">{activity.sender}</p>
                  </div>
                  <p className="activity-time">{formatDate(activity.created_at)}</p>
                </>
              ) : (
                <>
                  <div className="activity-type">
                    <span className="badge reply-badge">Reply</span>
                    {activity.is_staff_reply && <span className="staff-badge">Staff</span>}
                  </div>
                  <div className="activity-content">
                    <p className="activity-subject">{activity.ticket_subject}</p>
                    <p className="activity-sender">{activity.sender}</p>
                  </div>
                  <p className="activity-time">{formatDate(activity.created_at)}</p>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No recent activity</p>
      )}
    </div>
  );
}