import { FloatingNav, HeroSection, BentoRevealGrid } from "@/features/landing-page";

export default function LandingPage() {
  return (
    <main className="bg-background min-h-screen">
      <FloatingNav />
      <HeroSection />
      <BentoRevealGrid />
      
      {/* Spacer for scroll depth */}
      <div className="h-64" />
    </main>
  );
}
