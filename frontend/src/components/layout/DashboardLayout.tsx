import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { FloatingIslandNav } from './FloatingIslandNav';

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header removed */}
        <main className="flex-1 p-4 md:p-8 flex flex-col overflow-auto relative">
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer variant="dashboard" />
        </main>
      </div>
      <FloatingIslandNav />
    </div>
  );
}
