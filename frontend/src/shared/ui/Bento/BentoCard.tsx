// frontend/src/shared/ui/Bento/BentoCard.tsx
import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  span?: number; // 1-12
}

export function BentoCard({ children, className, span = 4 }: BentoCardProps) {
  const spanClass = {
    1: "md:col-span-1", 2: "md:col-span-2", 3: "md:col-span-3", 4: "md:col-span-4",
    5: "md:col-span-5", 6: "md:col-span-6", 7: "md:col-span-7", 8: "md:col-span-8",
    9: "md:col-span-9", 10: "md:col-span-10", 11: "md:col-span-11", 12: "md:col-span-12",
  }[span] || "md:col-span-4";

  return (
    <div className={cn(
      "p-6 bg-card border border-border rounded-lg shadow-sm transition-all duration-300",
      "hover:border-primary/50 hover:shadow-md group relative overflow-hidden",
      spanClass,
      className
    )}>
      {/* Radial Glow Effect */}
      <div className="absolute inset-0 bg-radial-gradient from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}
