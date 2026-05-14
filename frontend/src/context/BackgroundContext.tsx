import React, { createContext, useContext, useState } from 'react';

export type BackgroundType = 'grid' | 'nebula' | 'grain' | 'none';

interface BackgroundContextType {
  background: BackgroundType;
  setBackground: (bg: BackgroundType) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [background, setBackgroundState] = useState<BackgroundType>(() => {
    return (localStorage.getItem('app-background') as BackgroundType) || 'grid';
  });

  const setBackground = (bg: BackgroundType) => {
    setBackgroundState(bg);
    localStorage.setItem('app-background', bg);
  };

  return (
    <BackgroundContext.Provider value={{ background, setBackground }}>
      <BackgroundRenderer type={background} />
      {children}
    </BackgroundContext.Provider>
  );
}

function BackgroundRenderer({ type }: { type: BackgroundType }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {type === 'grid' && (
        <div 
          className="absolute inset-0 opacity-[0.12]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
            backgroundSize: '32px 32px' 
          }} 
        />
      )}
      {type === 'nebula' && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
        </>
      )}
      {type === 'grain' && (
        <div 
          className="absolute inset-0 opacity-[0.03] contrast-150 brightness-150" 
          style={{ 
            backgroundImage: `url('https://www.transparenttextures.com/patterns/stardust.png')` 
          }} 
        />
      )}
    </div>
  );
}

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};
