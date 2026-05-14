// frontend/src/pages/Landing.tsx
import { FloatingNav, HeroSection, BentoRevealGrid } from "@/features/landing-page";

export default function LandingPage() {
  return (
    <main className="min-h-screen selection:bg-primary/30 selection:text-primary">
      <FloatingNav />

      {/* Scroll Stage: 600vh of scroll depth to control the multi-phase motion */}
      <div className="relative h-[600vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Hero is the background centerpiece */}
          <HeroSection />

          {/* Bento Grid layer on top, with cards sliding in from corners */}
          <BentoRevealGrid />
        </div>
      </div>

      {/* Content continuation */}
      <section className="relative z-40 pt-32 pb-64 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">The Future of AI is Collaborative.</h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Join thousands of developers in the 2026 HackAI. Build, deploy, and scale your agents on the most advanced workbench ever created.
          </p>
          <div className="pt-8">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>
        </div>
      </section>
    </main>
  );
}
