// frontend/src/shared/ui/Bento/BentoGrid.tsx
import { type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[minmax(180px,auto)]", className)}>
      {children}
    </div>
  );
}
