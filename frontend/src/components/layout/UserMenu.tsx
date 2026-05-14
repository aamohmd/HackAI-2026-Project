import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, SignOut, UserCircle, CaretDown } from "@phosphor-icons/react";
import { useAuth } from '@/features/auth';
import { getUserDisplayName } from '@/shared/lib/utils';
import { cn } from '@/shared/lib/utils';

interface UserMenuProps {
  className?: string;
  align?: 'left' | 'right';
}

export function UserMenu({ className, align = 'right' }: UserMenuProps) {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className={cn("relative", className)} ref={userMenuRef}>
      <button 
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        className="flex items-center gap-3 p-1 rounded-full hover:bg-accent/50 transition-colors relative z-10"
      >
        <div className="text-right hidden sm:block px-2">
          <p className="text-sm font-semibold text-foreground flex items-center gap-1 justify-end">
            {getUserDisplayName(user)}
            <CaretDown size={12} className={cn('transition-transform', isUserMenuOpen && 'rotate-180')} />
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium opacity-60">
            {user?.email}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full border border-border bg-muted flex items-center justify-center overflow-hidden ring-2 ring-transparent hover:ring-primary/20 transition-all">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={20} weight="bold" className="text-muted-foreground" />
          )}
        </div>
      </button>

      {isUserMenuOpen && (
        <div className={cn(
          "absolute top-full mt-2 w-56 glass border border-border/50 rounded-xl shadow-2xl py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200",
          align === 'right' ? "right-0" : "left-0"
        )}>
          <div className="px-4 py-3 border-b border-border/10 mb-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Account</p>
          </div>
          
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all"
            onClick={() => setIsUserMenuOpen(false)}
          >
            <UserCircle size={18} weight="bold" />
            <span>Profile Settings</span>
          </Link>
          
          <button
            onClick={() => {
              setIsUserMenuOpen(false);
              logout();
            }}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
          >
            <SignOut size={18} weight="bold" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
