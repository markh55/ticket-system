import React, { useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Dashboard/Sidebar/Sidebar";
import Topbar from "../Dashboard/Topbar/Topbar";
import EventModal from "./EventModal";
import CalendarToolbar from "./CalendarToolbar";
import "./Calendar.css";

const locales = {
  "en-US": enUS,
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
      id: 1,
      title: "Sample Event 1",
      start: new Date(2024, 5, 10, 10, 0),
      end: new Date(2024, 5, 10, 12, 0),
      description: "Example description",
    },
    {
      id: 2,
      title: "Sample Event 2",
      start: new Date(2024, 5, 15, 14, 0),
      end: new Date(2024, 5, 15, 16, 0),
      description: "Another description",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const openCreateModal = (date = new Date()) => {
    setSelectedEvent(null);
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setSelectedDate(event.start);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData) => {
    if (selectedEvent) {
      setEvents(
        events.map((e) =>
          e.id === selectedEvent.id ? { ...e, ...eventData } : e
        )
      );
    } else {
      setEvents([...events, { ...eventData, id: events.length + 1 }]);
    }
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter((e) => e.id !== eventId));
  };

  return (
    <div className="calendar-container">
      <Sidebar className="calendar-sidebar" />
      <main className="calendar-content">
        <Topbar onLogout={handleLogout} />

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          view={currentView}
          onView={(view) => setCurrentView(view)}
          components={{
            toolbar: (toolbarProps) => (
              <CalendarToolbar
                label={toolbarProps.label}
                onNavigate={toolbarProps.onNavigate}
                onView={toolbarProps.onView}
                onAddEvent={() => openCreateModal()}
              />
            ),
          }}
        />

        <EventModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          selectedDate={selectedDate}
          selectedEvent={selectedEvent}
        />
      </main>
    </div>
  );
}
