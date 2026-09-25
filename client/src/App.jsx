import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import TrackComplaint from './pages/TrackComplaint.jsx';
import CitizenDashboard from './pages/CitizenDashboard.jsx';
import NewComplaint from './pages/NewComplaint.jsx';
import ComplaintDetails from './pages/ComplaintDetails.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminComplaintDetails from './pages/AdminComplaintDetails.jsx';

export default function App() {
  const { isAuthed, isAdmin } = useAuth();
  const home = !isAuthed ? '/' : isAdmin ? '/admin' : '/dashboard';

  return (
    <>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={isAuthed ? <Navigate to={home} replace /> : <Landing />} />
          <Route path="/login" element={isAuthed ? <Navigate to={home} replace /> : <Login />} />
          <Route path="/register" element={isAuthed ? <Navigate to={home} replace /> : <Register />} />
          <Route path="/track" element={<TrackComplaint />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="citizen">
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints/new"
            element={
              <ProtectedRoute role="citizen">
                <NewComplaint />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints/:code"
            element={
              <ProtectedRoute>
                <ComplaintDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints/:code"
            element={
              <ProtectedRoute role="admin">
                <AdminComplaintDetails />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <span>CityFix · Cloud-based Citizen Grievance Portal</span>
        <span className="muted">Built for the TCS Cloud Hackathon</span>
      </footer>
    </>
  );
}
