import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { RocketLaunch } from "@phosphor-icons/react";

export function HeroSection() {
  const { scrollYProgress } = useScroll();
  
  // Shrink from 1 to 0.8, increase radius from 0 to 2rem
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.3], ["0rem", "2rem"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  return (
    <section className="relative h-[150vh] flex flex-col items-center">
      <motion.div 
        style={{ scale, borderRadius, opacity }}
        className="sticky top-0 h-screen w-full bg-card border-b border-white/5 flex flex-col items-center justify-center overflow-hidden z-20"
      >
        {/* Background Accent */}
        <div className="absolute inset-0 bg-radial-gradient from-primary/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-8 px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tight text-foreground"
          >
            HACK<span className="text-primary">AI</span> 2026
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
          >
            The one line description placeholder for the next generation of AI builders.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button size="lg" className="h-14 px-8 text-lg gap-2">
              <RocketLaunch size={24} weight="bold" />
              CTA PLACEHOLDER FOR NOW
            </Button>
          </motion.div>
        </div>

        {/* Hero Visual Placeholder */}
        <div className="absolute bottom-0 w-full max-w-5xl h-64 bg-gradient-to-t from-primary/20 to-transparent blur-3xl opacity-50" />
      </motion.div>
    </section>
  );
}
