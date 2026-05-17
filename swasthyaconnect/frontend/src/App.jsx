import { Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';

const RoleLanding = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
};

const AppShell = ({ children }) => {
  return (
    <div className="min-h-screen bg-grid-pattern">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 px-4 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RoleLanding />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
        <Route
          path="/patient"
          element={
            <AppShell>
              <PatientDashboard />
            </AppShell>
          }
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
        <Route
          path="/doctor"
          element={
            <AppShell>
              <DoctorDashboard />
            </AppShell>
          }
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route
          path="/admin"
          element={
            <AppShell>
              <AdminDashboard />
            </AppShell>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
