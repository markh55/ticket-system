import React from "react";

export default function CalendarToolbar({ label, onNavigate, onView, onAddEvent }) {
    console.log('CalendarToolbar received props:', { 
        label, 
        hasOnNavigate: !!onNavigate, 
        hasOnView: !!onView, 
        hasOnAddEvent: !!onAddEvent 
    });

    const handleNavigate = (action) => {
        console.log('Navigate clicked:', action);
        if (onNavigate) {
            onNavigate(action);
        } else {
            console.error('onNavigate is not defined!');
        }
    };

    const handleView = (view) => {
        console.log('View clicked:', view);
        if (onView) {
            onView(view);
        } else {
            console.error('onView is not defined!');
        }
    };

    const handleAddEvent = () => {
        console.log('Add event clicked');
        if (onAddEvent) {
            onAddEvent();
        } else {
            console.error('onAddEvent is not defined!');
        }
    };

    return (
        <div className="rbc-toolbar" style={{ position: "relative", padding: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            
            {/* Left: Navigation */}
            <div className="rbc-btn-group">
                <button type="button" onClick={() => handleNavigate("PREV")}>‹</button>
                <button type="button" onClick={() => handleNavigate("TODAY")}>Today</button>
                <button type="button" onClick={() => handleNavigate("NEXT")}>›</button>
            </div>

            {/* Center: Label */}
            <span className="rbc-toolbar-label" style={{ fontWeight: "bold", fontSize: "16px" }}>{label}</span>

            {/* Right: Views + Add button */}
            <div className="rbc-btn-group" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button type="button" onClick={() => handleView("month")}>Month</button>
                <button type="button" onClick={() => handleView("week")}>Week</button>
                <button type="button" onClick={() => handleView("day")}>Day</button>

                {/* + Button */}
                <button
                    onClick={handleAddEvent}
                    style={{
                        background: "#2563eb",
                        color: "#fff",
                        borderRadius: "50%",
                        width: "36px",
                        height: "36px",
                        fontSize: "22px",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    +
                </button>
            </div>
        </div>
    );
}