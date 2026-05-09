import React from 'react';
import { Sun, Moon, Desktop } from "@phosphor-icons/react";
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const AppearanceSection: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'light', label: 'Light', icon: Sun, description: 'Clean and bright' },
    { id: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
    { id: 'system', label: 'System', icon: Desktop, description: 'Match your OS' },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Appearance</CardTitle>
        <CardDescription>Choose how the platform looks to you.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200",
                theme === t.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/50 hover:bg-accent"
              )}
            >
              <t.icon 
                size={32} 
                weight={theme === t.id ? "bold" : "regular"} 
                className={theme === t.id ? "text-primary" : "text-muted-foreground"}
              />
              <div className="text-center">
                <p className="font-semibold text-sm">{t.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
