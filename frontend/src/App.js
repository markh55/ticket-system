import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import CalendarComponent from './components/Calendar/Calendar';
import TicketList from './components/Tickets/TicketList';
import './components/Responsive.css';

function App() {
  return (
   <BrowserRouter>
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendar" element={<CalendarComponent />} />
        <Route path="/tickets" element={<TicketList />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </div>
    </BrowserRouter>
  );
}

export default App;