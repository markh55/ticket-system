import React, { useState } from "react";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import Sidebar from '../Dashboard/Sidebar/Sidebar';
import "./Calendar.css";

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
    getDay,
    locales,
});

export default function CalendarComponent() {
    const [events, setEvents] = useState([
        {
            title: "Sample Event 1",
            start: new Date(2024, 5, 10, 10, 0),
            end: new Date(2024, 5, 10, 12, 0),
        },
        {
            title: "Sample Event 2",
            start: new Date(2024, 5, 15, 14, 0),
            end: new Date(2024, 5, 15, 16, 0),
        },
    ]);

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e40af 100%)" }}>
            <Sidebar className="calendar-sidebar" />
            <main style={{ flex: 1, padding: "20px", marginLeft: "260px" }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "calc(100vh - 40px)" }}
                />
            </main>
        </div>
    );
}