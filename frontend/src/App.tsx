import { Routes, Route } from 'react-router-dom';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { getUserDisplayName } from '@/lib/utils';

function DashboardHome() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {getUserDisplayName(user)}.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 bg-card rounded-lg border border-border shadow-sm">
            <h3 className="font-semibold text-sm text-muted-foreground">Metric {i}</h3>
            <p className="text-2xl font-bold mt-2">--</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePlaceholder() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
      <p className="text-muted-foreground">Manage your account settings and profile information.</p>
      <div className="p-8 bg-card rounded-lg border border-border border-dashed flex items-center justify-center text-muted-foreground">
        Profile content coming soon...
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/profile" element={<ProfilePlaceholder />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;

