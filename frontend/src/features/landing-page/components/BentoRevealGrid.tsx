import { motion, useScroll, useTransform } from "framer-motion";
import { BentoGrid, BentoCard } from "@/shared/ui/Bento";
import { Cpu, Globe, Lightning, Shield } from "@phosphor-icons/react";

export function BentoRevealGrid() {
  const { scrollYProgress } = useScroll();
  
  // Slide up and fade in as we scroll past the hero shrink phase
  const y = useTransform(scrollYProgress, [0.2, 0.5], [100, 0]);
  const opacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);

  const cards = [
    { title: "Neural Core", icon: Cpu, span: 8, desc: "Powered by next-gen LLM orchestration." },
    { title: "Global Mesh", icon: Globe, span: 4, desc: "Deploy to the edge in seconds." },
    { title: "Instant Sync", icon: Lightning, span: 4, desc: "Real-time state synchronization." },
    { title: "Secure Vault", icon: Shield, span: 8, desc: "Enterprise-grade isolation for your agents." },
  ];

  return (
    <motion.div 
      style={{ y, opacity }}
      className="max-w-7xl mx-auto px-4 pb-32 -mt-32 relative z-30"
    >
      <BentoGrid>
        {cards.map((card, i) => (
          <BentoCard key={i} span={card.span} className="flex flex-col justify-between min-h-[300px]">
            <div className="p-3 bg-primary/10 rounded-xl w-fit text-primary mb-4">
              <card.icon size={32} weight="duotone" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
              <p className="text-muted-foreground">{card.desc}</p>
            </div>
          </BentoCard>
        ))}
      </BentoGrid>
    </motion.div>
  );
}
