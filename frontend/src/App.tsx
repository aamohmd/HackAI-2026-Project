import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/pages/Landing';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import SettingsPage from '@/pages/Settings';
import DashboardPage from '@/pages/Dashboard';
import { MobileHub } from '@/pages/MobileHub';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/features/auth/hooks/useAuth';

function App() {
  const isMobile = window.innerWidth < 768;
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={
        isMobile ? (
          user ? <MobileHub /> : <Navigate to="/login" />
        ) : <LandingPage />
      } />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
