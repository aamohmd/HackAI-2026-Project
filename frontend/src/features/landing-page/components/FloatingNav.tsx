import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { useAuth } from "@/features/auth";
import { UserMenu } from "@/components/layout/UserMenu";

export function FloatingNav() {
  const { user } = useAuth();
  const { scrollY } = useScroll();
  
  // Subtle transitions as we scroll
  const shadowOpacity = useTransform(scrollY, [0, 100], [0, 0.1]);
  const scale = useTransform(scrollY, [0, 100], [1, 0.98]);

  return (
    <motion.nav 
      style={{ 
        x: "-50%",
        scale,
        boxShadow: useTransform(shadowOpacity, (o) => `0 25px 50px -12px rgba(0, 0, 0, ${o})`),
      }}
      className="fixed top-6 left-1/2 z-50 w-[95%] max-w-7xl px-8 py-3 rounded-full flex items-center justify-between glass border shadow-2xl transition-all duration-300"
    >
      <div className="flex items-center gap-2">
        <Link to="/" className="font-bold text-xl tracking-tighter text-foreground uppercase glow-primary">HackAI</Link>
      </div>

      <div className="hidden md:block">
        <Navigation compacted={false} />
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <UserMenu align="right" />
        ) : (
          <>
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Login</Link>
            <Button size="sm" variant="primary" asChild className="px-6">
              <Link to="/register">Join HackAI</Link>
            </Button>
          </>
        )}
      </div>
    </motion.nav>
  );
}
