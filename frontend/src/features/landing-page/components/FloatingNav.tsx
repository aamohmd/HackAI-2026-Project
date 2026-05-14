import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { Link } from "react-router-dom";

export function FloatingNav() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [0, 1]);
  const y = useTransform(scrollY, [0, 100], [-20, 0]);

  return (
    <motion.nav 
      style={{ opacity, y, x: "-50%" }}
      className="fixed top-6 left-1/2 z-50 w-[90%] max-w-4xl glass px-6 py-3 rounded-full flex items-center justify-between border border-white/10 shadow-2xl"
    >
      <div className="flex items-center gap-2">
        <span className="font-bold text-xl tracking-tighter text-foreground">HackAI</span>
      </div>
      <div className="flex items-center gap-6">
        <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Login</Link>
        <Button size="sm" asChild>
          <Link to="/register">Join HackAI</Link>
        </Button>
      </div>
    </motion.nav>
  );
}
