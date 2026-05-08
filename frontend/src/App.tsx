import { Routes, Route } from 'react-router-dom';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <h1 className="text-3xl font-bold">Welcome, {user?.email}!</h1>
      <p className="text-muted-foreground">You are logged in to the HackAI 2026 Boilerplate.</p>
      <Button onClick={logout} variant="outline">Logout</Button>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
