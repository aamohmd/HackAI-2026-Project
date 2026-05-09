import React from 'react';
import { Gear, Bell, PaintBrush, WarningCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const tabs = [
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
    <nav className="flex flex-col gap-1 w-full md:w-64">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium",
            activeTab === tab.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : cn(
                  "text-muted-foreground hover:text-foreground hover:bg-accent",
                  tab.id === 'danger' && "hover:text-destructive hover:bg-destructive/10"
                )
          )}
        >
          <tab.icon size={20} weight={activeTab === tab.id ? "bold" : "regular"} />
          {tab.label}
        </button>
      ))}
    </nav>
  );
};
