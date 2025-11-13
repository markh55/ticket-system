import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';

function App() {
  return (
   <BrowserRouter>
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<div>Dashboard - Coming Soon</div>} />
      </Routes>
    </div>
    </BrowserRouter>
  );
}

export default App;