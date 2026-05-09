import { useAuth } from '@/hooks/useAuth';
import { User } from "@phosphor-icons/react";
import { getUserDisplayName } from '@/lib/utils';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-end px-8 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="text-right">
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
