import React from "react";

export default function CalendarToolbar({
  label,
  onNavigate,
  onView,
  onAddEvent,
}) {
  const handleNavigate = (action) => {
    if (onNavigate) {
      onNavigate(action);
    }
  };

  const handleView = (view) => {
    if (onView) {
      onView(view);
    }
  };

  const handleAddEvent = () => {
    if (onAddEvent) {
      onAddEvent();
    }
  };

  return (
    <div className="rbc-toolbar" style={{ padding: "10px" }}>
      {/* Row 1: Nav buttons TOP LEFT */}
      <div style={{ marginBottom: "10px" }}>
        <div className="rbc-btn-group">
          <button type="button" onClick={() => handleNavigate("PREV")}>
            ‹
          </button>
          <button type="button" onClick={() => handleNavigate("TODAY")}>
            Today
          </button>
          <button type="button" onClick={() => handleNavigate("NEXT")}>
            ›
          </button>
        </div>
      </div>

      {/* Row 2: Three separate positioned sections */}
      <div style={{ position: "relative", minHeight: "40px" }}>
        {/* Left: View buttons */}
        <div style={{ position: "absolute", left: 0 }}>
          <div className="rbc-btn-group">
            <button type="button" onClick={() => handleView("month")}>
              Month
            </button>
            <button type="button" onClick={() => handleView("week")}>
              Week
            </button>
            <button type="button" onClick={() => handleView("day")}>
              Day
            </button>
          </div>
        </div>

        {/* Center: Date */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            className="rbc-toolbar-label"
            style={{
              fontWeight: "bold",
              fontSize: "16px",
              color: "#e2e8f0",
            }}
          >
            {label}
          </span>
        </div>

        {/* Right: Plus button */}
        <div style={{ position: "absolute", right: 0 }}>
          <button
            onClick={handleAddEvent}
            className="add-event-btn"
            style={{
              background: "#2563eb",
              color: "#fff",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              fontSize: "22px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
