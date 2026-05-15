import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { RocketLaunch } from "@phosphor-icons/react";

export function HeroSection() {
  const { scrollYProgress } = useScroll();
  
  // Phase 1: Shrink from 1 to 0.6 (Entry)
  const scale = useTransform(scrollYProgress, [0, 0.15], [1, 0.6]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.15], ["0rem", "2.5rem"]);
  
  // Exit stages aligned with bento phases
  const divergeY = useTransform(scrollYProgress, [0.15, 0.25], ["0%", "-150%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.3], [1, 1, 0.9, 0]);

  return (
    <motion.div 
      style={{ scale, borderRadius, opacity, y: divergeY }}
      className="absolute inset-0 w-full h-full bg-card border border-white/10 flex flex-col items-center justify-center overflow-hidden z-20 shadow-2xl"
    >
      {/* Background Accent */}
      <div className="absolute inset-0 bg-radial-gradient from-primary/20 to-transparent pointer-events-none opacity-50" />
      
      <div className="relative z-10 text-center space-y-8 px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-9xl font-black tracking-tighter text-foreground uppercase glow-primary"
        >
          HACKAI
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium"
        >
          The one line description placeholder for the next generation of AI builders.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button size="lg" variant="primary" className="h-16 px-10 text-xl gap-3 transition-all">
            <RocketLaunch size={28} weight="bold" />
            CTA PLACEHOLDER
          </Button>
        </motion.div>
      </div>

      {/* Hero Visual Placeholder */}
      <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-primary/30 to-transparent blur-3xl opacity-30" />
    </motion.div>
  );
}
