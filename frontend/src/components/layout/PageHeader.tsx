import { cn } from '@/shared/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("space-y-2 relative z-10", className)}>
      <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase glow-primary">
        {title}
      </h1>
      {description && (
        <p className="text-lg text-muted-foreground font-medium max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}
