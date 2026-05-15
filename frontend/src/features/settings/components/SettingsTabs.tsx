import React from 'react';
import { Gear, Bell, PaintBrush, WarningCircle, User } from "@phosphor-icons/react";
import { cn } from "@/shared/lib/utils";

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'general', label: 'General', icon: Gear },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: PaintBrush },
  { id: 'danger', label: 'Danger Zone', icon: WarningCircle },
];

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const SettingsTabs: React.FC<SettingsTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="flex flex-col gap-2 w-full md:w-64 relative z-10">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-bold tracking-tight relative overflow-hidden border",
            activeTab === tab.id
              ? "bg-card text-foreground border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]"
              : cn(
                  "text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/50 hover:border-border/50",
                  tab.id === 'danger' && "hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20"
                )
          )}
        >
          <tab.icon 
            size={20} 
            className="transition-transform group-hover:scale-110"
            weight={activeTab === tab.id ? "bold" : "regular"} 
          />
          <span className="relative z-10">{tab.label}</span>
          
          {/* Hover Radial Glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-radial-gradient from-primary/5 to-transparent transition-opacity pointer-events-none" />
        </button>
      ))}
    </nav>
  );
};
