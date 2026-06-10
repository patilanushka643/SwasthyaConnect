import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import VideoConsult from './pages/VideoConsult';
import Dashboard from './pages/Dashboard';
import BookAppointment from './pages/sections/BookAppointment';
import MyAppointments from './pages/sections/MyAppointments';
import DakshConsult from './pages/sections/DakshConsult';
import EVisit from './pages/sections/EVisit';
import EVisitHistory from './pages/sections/EVisitHistory';
import LabReports from './pages/sections/LabReports';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/otp" element={<Navigate to="/login" replace />} />
      <Route path="/consultation/:id" element={<VideoConsult />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/book-appointment" element={<BookAppointment />} />
      <Route path="/dashboard/my-appointments" element={<MyAppointments />} />
      <Route path="/dashboard/daksh" element={<DakshConsult />} />
      <Route path="/dashboard/evisit" element={<EVisit />} />
      <Route path="/dashboard/evisit-history" element={<EVisitHistory />} />
      <Route path="/dashboard/lab-reports" element={<LabReports />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
