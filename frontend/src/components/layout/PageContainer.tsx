import React from 'react';
import { cn } from '@/shared/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const maxWithClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-none',
};

export function PageContainer({ 
  children, 
  className, 
  maxWidth = 'lg' 
}: PageContainerProps) {
  return (
    <div className={cn(
      "relative min-h-[calc(100vh-120px)] p-1 space-y-12 w-full",
      maxWithClasses[maxWidth],
      className
    )}>
      {/* Background Pattern: Subtle Dotted Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.04]" 
           style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
      />
      
      {children}
    </div>
  );
}
