import { motion, useScroll, useTransform } from "framer-motion";
import { BentoCard } from "@/shared/ui/Bento";
import { Cpu, Globe, Lightning, Shield } from "@phosphor-icons/react";

export function BentoRevealGrid() {
  const { scrollYProgress } = useScroll();
  
  // Overall reveal and exit fade
  const opacity = useTransform(scrollYProgress, [0.05, 0.12, 0.95, 1.0], [0, 1, 1, 0]);
  
  /**
   * UNIFIED TIMELINE (10 Points)
   * 0: Start
   * 0.15: Reveal Complete (Around Hero)
   * 0.25: Grid Ready (C1->4, C3->7, C4->8, C2->9)
   * 0.30: Start Shift 1
   * 0.45: Shift 1 Done (C1->1, C3->4, C4->7, C2->8)
   * 0.50: Start Shift 2
   * 0.65: Shift 2 Done (C3->1, C4->4, C2->7)
   * 0.70: Start Shift 3
   * 0.85: Shift 3 Done (C4->1, C2->4)
   * 1.0: End
   */
  const timeline = [0, 0.15, 0.25, 0.30, 0.45, 0.50, 0.65, 0.70, 0.85, 1.0];

  // Card 1: Neural Core
  const card1X = useTransform(scrollYProgress, timeline, ["-700px", "-350px", "-400px", "-400px", "-400px", "-400px", "-400px", "-400px", "-400px", "-400px"]);
  const card1Y = useTransform(scrollYProgress, timeline, ["-400px", "-250px", "0px", "0px", "-300px", "-300px", "-300px", "-300px", "-300px", "-300px"]);
  const card1Op = useTransform(scrollYProgress, timeline, [1, 1, 1, 1, 0, 0, 0, 0, 0, 0]);

  // Card 3: Instant Sync
  const card3X = useTransform(scrollYProgress, timeline, ["-700px", "-350px", "-400px", "-400px", "-400px", "-400px", "-400px", "-400px", "-400px", "-400px"]);
  const card3Y = useTransform(scrollYProgress, timeline, ["400px", "250px", "300px", "300px", "0px", "0px", "-300px", "-300px", "-300px", "-300px"]);
  const card3Op = useTransform(scrollYProgress, timeline, [1, 1, 1, 1, 1, 1, 0, 0, 0, 0]);

  // Card 4: Secure Vault
  const card4X = useTransform(scrollYProgress, timeline, ["700px", "350px", "0px", "0px", "-400px", "-400px", "-400px", "-400px", "-400px", "-400px"]);
  const card4Y = useTransform(scrollYProgress, timeline, ["400px", "250px", "300px", "300px", "300px", "300px", "0px", "0px", "-300px", "-300px"]);
  const card4Op = useTransform(scrollYProgress, timeline, [1, 1, 1, 1, 1, 1, 1, 1, 0, 0]);

  // Card 2: Global Mesh
  const card2X = useTransform(scrollYProgress, timeline, ["700px", "350px", "400px", "400px", "0px", "0px", "-400px", "-400px", "-400px", "-400px"]);
  const card2Y = useTransform(scrollYProgress, timeline, ["-400px", "-250px", "300px", "300px", "300px", "300px", "300px", "300px", "0px", "0px"]);

  // Sequential Descriptions - Perfectly synced with Card Focus/Shift
  // D1 (Neural Core) Waits for Grid Ready (0.25), Delayed appearance until 0.28, Shift out at 0.3-0.45
  const d1Op = useTransform(scrollYProgress, [0, 0.25, 0.28, 0.30, 0.45], [0, 0, 1, 1, 0]);
  const d1Y = useTransform(scrollYProgress, [0, 0.25, 0.28, 0.30, 0.45], ["100px", "100px", "0px", "0px", "-300px"]);

  // D2 (Instant Sync) Shift in at 0.3-0.45, Focus at 0.45-0.5, Shift out at 0.5-0.65
  const d2Op = useTransform(scrollYProgress, timeline, [0, 0, 0, 0, 1, 1, 0, 0, 0, 0]);
  const d2Y = useTransform(scrollYProgress, timeline, ["100px", "100px", "100px", "100px", "0px", "0px", "-300px", "-300px", "-300px", "-300px"]);

  // D3 (Secure Vault) Shift in at 0.5-0.65, Focus at 0.65-0.7, Shift out at 0.7-0.85
  const d3Op = useTransform(scrollYProgress, timeline, [0, 0, 0, 0, 0, 0, 1, 1, 0, 0]);
  const d3Y = useTransform(scrollYProgress, timeline, ["100px", "100px", "100px", "100px", "100px", "100px", "0px", "0px", "-300px", "-300px"]);

  // D4 (Global Mesh) Shift in at 0.7-0.85, Focus at 0.85-1.0
  const d4Op = useTransform(scrollYProgress, timeline, [0, 0, 0, 0, 0, 0, 0, 0, 1, 1]);
  const d4Y = useTransform(scrollYProgress, timeline, ["100px", "100px", "100px", "100px", "100px", "100px", "100px", "100px", "0px", "0px"]);

  const FeatureDescription = ({ opacity, y, title, subtitle, desc, refCode }: any) => (
    <motion.div 
      style={{ opacity, y, x: "220px" }}
      className="absolute w-[750px] text-left space-y-6"
    >
      <div className="space-y-2">
        <span className="text-xs font-mono text-primary uppercase tracking-[0.3em]">{subtitle}</span>
        <h2 className="text-4xl font-black tracking-tight text-foreground">{title}</h2>
      </div>
      <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
        {desc}
      </p>
      <div className="flex items-center gap-4 pt-4">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
        <span className="text-[10px] font-mono text-muted-foreground uppercase">{refCode}</span>
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      style={{ opacity }}
      className="absolute inset-0 pointer-events-none z-30 overflow-hidden flex items-center justify-center"
    >
      <div className="relative w-full max-w-7xl h-full flex items-center justify-center">
        {/* Card 1: Neural Core */}
        <motion.div style={{ x: card1X, y: card1Y, opacity: card1Op }} className="absolute w-[350px] h-[220px] pointer-events-auto">
          <BentoCard className="h-full flex flex-col justify-between border-primary/20 bg-card/80 backdrop-blur-md">
            <div className="p-3 bg-primary/10 rounded-xl w-fit text-primary"><Cpu size={32} weight="duotone" /></div>
            <div><h3 className="text-xl font-bold">Neural Core</h3><p className="text-sm text-muted-foreground">Next-gen LLM orchestration.</p></div>
          </BentoCard>
        </motion.div>

        {/* Card 3: Instant Sync */}
        <motion.div style={{ x: card3X, y: card3Y, opacity: card3Op }} className="absolute w-[350px] h-[220px] pointer-events-auto">
          <BentoCard className="h-full flex flex-col justify-between border-primary/20 bg-card/80 backdrop-blur-md">
            <div className="p-3 bg-primary/10 rounded-xl w-fit text-primary"><Lightning size={32} weight="duotone" /></div>
            <div><h3 className="text-xl font-bold">Instant Sync</h3><p className="text-sm text-muted-foreground">Real-time state synchronization.</p></div>
          </BentoCard>
        </motion.div>

        {/* Card 4: Secure Vault */}
        <motion.div style={{ x: card4X, y: card4Y, opacity: card4Op }} className="absolute w-[350px] h-[220px] pointer-events-auto">
          <BentoCard className="h-full flex flex-col justify-between border-primary/20 bg-card/80 backdrop-blur-md">
            <div className="p-3 bg-primary/10 rounded-xl w-fit text-primary"><Shield size={32} weight="duotone" /></div>
            <div><h3 className="text-xl font-bold">Secure Vault</h3><p className="text-sm text-muted-foreground">Enterprise-grade isolation.</p></div>
          </BentoCard>
        </motion.div>

        {/* Card 2: Global Mesh */}
        <motion.div style={{ x: card2X, y: card2Y }} className="absolute w-[350px] h-[220px] pointer-events-auto">
          <BentoCard className="h-full flex flex-col justify-between border-primary/20 bg-card/80 backdrop-blur-md">
            <div className="p-3 bg-primary/10 rounded-xl w-fit text-primary"><Globe size={32} weight="duotone" /></div>
            <div><h3 className="text-xl font-bold">Global Mesh</h3><p className="text-sm text-muted-foreground">Deploy to the edge in seconds.</p></div>
          </BentoCard>
        </motion.div>

        {/* Sequential Descriptions */}
        <FeatureDescription 
          opacity={d1Op} y={d1Y}
          subtitle="Module Activation: 01"
          title="Neural Core Orchestration"
          desc="Experience the next generation of LLM management. Our core engine dynamically routes requests through optimized neural pathways, ensuring sub-100ms response times for even the most complex agent tasks."
          refCode="Ref: CORE-X86-ALPHA"
        />

        <FeatureDescription 
          opacity={d2Op} y={d2Y}
          subtitle="Module Activation: 02"
          title="Instant Sync Protocol"
          desc="Zero-latency state synchronization across your entire cluster. Whether you are running three agents or three thousand, our distributed mesh keeps memory and context perfectly aligned in real-time."
          refCode="Ref: SYNC-MESH-v2"
        />

        <FeatureDescription 
          opacity={d3Op} y={d3Y}
          subtitle="Module Activation: 03"
          title="Secure Vault Isolation"
          desc="Enterprise-grade security at every layer. Each agent operates within a cryptographically isolated vault, protecting sensitive PII and SPI while maintaining full high-speed access to the neural core."
          refCode="Ref: VAULT-SEC-9"
        />

        <FeatureDescription 
          opacity={d4Op} y={d4Y}
          subtitle="Module Activation: 04"
          title="Global Mesh Delivery"
          desc="Deploy your agents to the edge in seconds. Our global infrastructure ensures that your AI presence is physically close to your users, minimizing round-trip times and providing a seamless interactive experience."
          refCode="Ref: EDGE-GRID-00"
        />
      </div>
    </motion.div>
  );
}
