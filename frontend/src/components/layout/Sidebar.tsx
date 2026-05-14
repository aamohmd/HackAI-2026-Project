import { NavLink } from 'react-router-dom';
import { SignOut } from "@phosphor-icons/react";
import { useAuth } from '@/features/auth';
import { cn } from '@/shared/lib/utils';
import { navItems } from '@/config/navigation';

interface SidebarContentProps {
  onItemClick?: () => void;
}

export function SidebarContent({ onItemClick }: SidebarContentProps) {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col h-full relative">
      {/* Background Pattern: Subtle Dotted Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
      />

      <div className="p-8 flex items-center gap-3 relative z-10">
        <span className="font-black text-2xl tracking-tighter text-foreground uppercase glow-primary">
          HackAI
        </span>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2 relative z-10">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onItemClick}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative border",
                isActive
                  ? "bg-card text-foreground border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/50 hover:border-border/50"
              )
            }
          >
            <item.icon 
              size={22} 
              className="transition-transform group-hover:scale-110"
              weight="regular" 
            />
            <span className="font-bold tracking-tight">{item.label}</span>
            
            {/* Hover Radial Glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-radial-gradient from-primary/5 to-transparent transition-opacity pointer-events-none" />
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-border/50 relative z-10">
        <button
          onClick={() => {
            onItemClick?.();
            logout();
          }}
          className="group flex items-center gap-3 px-4 py-3 w-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all duration-300"
        >
          <SignOut size={22} weight="regular" className="group-hover:translate-x-1 transition-transform" />
          <span className="font-bold tracking-tight">Logout</span>
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-72 bg-card/30 backdrop-blur-xl text-card-foreground flex-col h-screen sticky top-0 border-r border-border/50 shadow-2xl">
      <SidebarContent />
    </aside>
  );
}
