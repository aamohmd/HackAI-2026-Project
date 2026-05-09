import { Routes, Route } from 'react-router-dom';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import ProfilePage from '@/pages/Profile';
import DashboardPage from '@/pages/Dashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { getUserDisplayName } from '@/lib/utils';

<Route element={<ProtectedRoute />}>
  <Route element={<DashboardLayout />}>
    <Route path="/" element={<DashboardPage />} />
    <Route path="/profile" element={<ProfilePage />} />
  </Route>
</Route>


export default App;

