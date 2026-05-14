import React from 'react';
import { Sun, Moon, Desktop, GridFour, Wind, Sparkle, Prohibit } from "@phosphor-icons/react";
import { useTheme } from '@/context/ThemeContext';
import { useBackground } from '@/context/BackgroundContext';
import type { BackgroundType } from '@/context/BackgroundContext';
import { cn } from '@/shared/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui/card';

export const AppearanceSection: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { background, setBackground } = useBackground();

  const themes = [
    { id: 'light', label: 'Light', icon: Sun, description: 'Clean and bright' },
    { id: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
    { id: 'system', label: 'System', icon: Desktop, description: 'Match your OS' },
  ] as const;

  const backgrounds = [
    { id: 'grid', label: 'Tactical Grid', icon: GridFour, description: 'Blueprint feel' },
    { id: 'nebula', label: 'Ambient Nebula', icon: Wind, description: 'Cinematic depth' },
    { id: 'grain', label: 'Cinematic Grain', icon: Sparkle, description: 'Analog texture' },
    { id: 'none', label: 'None', icon: Prohibit, description: 'Pure black' },
  ] as const;

  return (
    <div className="space-y-6">
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
                  "flex flex-col items-center gap-3 p-6 rounded-xl border transition-all duration-200",
                  theme === t.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-white/10 hover:border-primary/50 hover:bg-accent"
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

      <Card>
        <CardHeader>
          <CardTitle>Background Style</CardTitle>
          <CardDescription>Add depth and refinement to the background space.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {backgrounds.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setBackground(bg.id as BackgroundType)}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-xl border transition-all duration-200",
                  background === bg.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-white/10 hover:border-primary/50 hover:bg-accent"
                )}
              >
                <bg.icon 
                  size={32} 
                  weight={background === bg.id ? "bold" : "regular"} 
                  className={background === bg.id ? "text-primary" : "text-muted-foreground"}
                />
                <div className="text-center">
                  <p className="font-semibold text-sm">{bg.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{bg.description}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
