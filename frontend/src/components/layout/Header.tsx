import { useAuth } from '@/features/auth';
import { User, List } from "@phosphor-icons/react";
import { getUserDisplayName } from '@/shared/lib/utils';
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger,
  DialogTitle,
  DialogDescription
} from '@/shared/ui/dialog';
import { SidebarContent } from './Sidebar';
import { Button } from '@/shared/ui/button';

export function Header() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-border/50 glass flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
      <div className="flex items-center gap-2 md:hidden">
        <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <List size={24} />
            </Button>
          </DialogTrigger>
          <DialogContent side="left" className="p-0 w-[280px]">
            <div className="hidden">
              <DialogTitle>Navigation Menu</DialogTitle>
              <DialogDescription>Access dashboard links and account settings.</DialogDescription>
            </div>
            <SidebarContent onItemClick={() => setIsMobileMenuOpen(false)} />
          </DialogContent>
        </Dialog>
        <span className="font-bold text-lg tracking-tight text-foreground">HackAI</span>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-foreground">
            {getUserDisplayName(user)}
          </p>
          <p className="text-xs text-muted-foreground">
            {user?.email}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full border border-border bg-muted flex items-center justify-center overflow-hidden">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={20} weight="bold" className="text-muted-foreground" />
          )}
        </div>
      </div>
    </header>
  );
}
