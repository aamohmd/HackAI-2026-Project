import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { List, X, SignOut } from "@phosphor-icons/react";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/features/auth';
import { cn } from '@/shared/lib/utils';
import { navItems } from '@/config/navigation';

export function FloatingIslandNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <div className="md:hidden">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[70] w-14 h-14 rounded-full glass border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.3)] flex items-center justify-center text-primary transition-transform active:scale-95"
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {isOpen ? <X size={28} weight="bold" /> : <List size={28} weight="bold" />}
        </motion.div>
      </button>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20, x: "-50%" }}
              animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, scale: 0.9, y: 20, x: "-50%" }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass border border-border/50 rounded-3xl shadow-2xl p-6 z-[65] overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                   style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
              />

              <div className="relative z-10 space-y-6">
                <div className="text-center">
                  <span className="font-black text-xl tracking-tighter text-foreground uppercase glow-primary">
                    HackAI
                  </span>
                </div>

                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                    >
                      {({ isActive }) => (
                        <div className={cn(
                          "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all border",
                          isActive
                            ? "bg-card text-foreground border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                            : "text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/50"
                        )}>
                          <item.icon size={24} weight={isActive ? "bold" : "regular"} />
                          <span className="font-bold">{item.label}</span>
                        </div>
                      )}
                    </NavLink>
                  ))}
                </nav>

                <div className="pt-4 border-t border-border/50">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-4 px-4 py-4 w-full text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <SignOut size={24} />
                    <span className="font-bold">Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
