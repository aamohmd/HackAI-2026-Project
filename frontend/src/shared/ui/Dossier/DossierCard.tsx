import React from 'react';
import { RubberStamp } from './RubberStamp';

interface DossierCardProps {
  name: string;
  icon: React.ReactNode;
  description?: string;
  completed?: boolean;
  className?: string;
}

export const DossierCard = ({ name, icon, description, completed, className = "" }: DossierCardProps) => (
  <div className={`relative p-6 border-2 ${completed ? 'border-wax' : 'border-midnight/10'} bg-parchment-50 shadow-sm transition-all hover:shadow-md ${className}`}>
    <div className="flex items-center gap-3 mb-3">
      <span className="text-wax w-6 h-6">{icon}</span>
      <h3 className="font-heading font-bold text-midnight uppercase tracking-wide text-sm">{name}</h3>
    </div>
    <p className="text-midnight/80 font-sans text-sm leading-relaxed min-h-[1.5rem]">
      {description || <span className="text-midnight/30 italic">Information required for the brief...</span>}
    </p>
    {completed && <RubberStamp text="Motabaq" />}
  </div>
);
