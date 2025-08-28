import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import GuruDashboard from './components/Dashboard/GuruDashboard';
import SiswaDashboard from './components/Dashboard/SiswaDashboard';
import KelasManagement from './pages/Guru/KelasManagement';
import SiswaManagement from './pages/Guru/SiswaManagement';
import VerifikasiAktivitas from './pages/Guru/VerifikasiAktivitas';
import RekapAktivitas from './pages/Guru/RekapAktivitas';
import LevelManagement from './pages/Guru/LevelManagement';
import ProfilGuru from './pages/Guru/ProfilGuru';
import TambahAktivitas from './pages/Siswa/TambahAktivitas';
import DaftarAktivitas from './pages/Siswa/DaftarAktivitas';
import Leaderboard from './pages/Leaderboard';
import ProfilSiswa from './pages/Siswa/ProfilSiswa';
import NotificationToast from './components/UI/NotificationToast';
import LoadingSpinner from './components/UI/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/" element={<Layout />}>
        <Route path="dashboard" element={
          user.role === 'guru' ? <GuruDashboard /> : <SiswaDashboard />
        } />
        
        {/* Guru Routes */}
        <Route path="kelas" element={
          <ProtectedRoute allowedRoles={['guru']}>
            <KelasManagement />
          </ProtectedRoute>
        } />
        <Route path="siswa" element={
          <ProtectedRoute allowedRoles={['guru']}>
            <SiswaManagement />
          </ProtectedRoute>
        } />
        <Route path="verifikasi" element={
          <ProtectedRoute allowedRoles={['guru']}>
            <VerifikasiAktivitas />
          </ProtectedRoute>
        } />
        <Route path="rekap" element={
          <ProtectedRoute allowedRoles={['guru']}>
            <RekapAktivitas />
          </ProtectedRoute>
        } />
        <Route path="level" element={
          <ProtectedRoute allowedRoles={['guru']}>
            <LevelManagement />
          </ProtectedRoute>
        } />
        <Route path="profil" element={
          user.role === 'guru' ? (
            <ProtectedRoute allowedRoles={['guru']}>
              <ProfilGuru />
            </ProtectedRoute>
          ) : (
            <ProtectedRoute allowedRoles={['siswa']}>
              <ProfilSiswa />
            </ProtectedRoute>
          )
        } />

        {/* Siswa Routes */}
        <Route path="aktivitas/tambah" element={
          <ProtectedRoute allowedRoles={['siswa']}>
            <TambahAktivitas />
          </ProtectedRoute>
        } />
        <Route path="aktivitas" element={
          <ProtectedRoute allowedRoles={['siswa']}>
            <DaftarAktivitas />
          </ProtectedRoute>
        } />

        {/* Shared Routes */}
        <Route path="leaderboard" element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        } />

        <Route path="" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
            <NotificationToast />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;