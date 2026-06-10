import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import VideoConsult from './pages/VideoConsult';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/otp" element={<Navigate to="/login" replace />} />
      <Route path="/consultation/:id" element={<VideoConsult />} />

      <Route path="/dashboard" element={<DashboardPage />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
