import { NavLink } from 'react-router-dom';
import { House, User, SignOut, FlyingSaucer } from "@phosphor-icons/react";
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: House, label: 'Dashboard', href: '/' },
  { icon: User, label: 'Profile', href: '/profile' },
];

export function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="hidden md:flex w-64 bg-card text-card-foreground flex-col h-screen sticky top-0 border-r border-border">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <FlyingSaucer size={20} weight="bold" className="text-primary-foreground" />
        </div>
        <span className="font-bold text-xl tracking-tight text-foreground">HackAI</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )
            }
          >
            <item.icon size={22} weight="regular" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
        >
          <SignOut size={22} weight="regular" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
