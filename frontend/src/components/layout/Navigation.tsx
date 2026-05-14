import { Link } from 'react-router-dom';
import { CaretDown } from "@phosphor-icons/react";
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';

interface NavLinkItem {
  label: string;
  href: string;
  external?: boolean;
}

interface NavSection {
  title: string;
  links: NavLinkItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Platform',
    links: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'API Reference', href: '#' },
      { label: 'System Status', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Guides', href: '#' },
      { label: 'GitHub', href: 'https://github.com', external: true },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ],
  },
];

interface NavigationProps {
  compacted?: boolean;
}

export function Navigation({ compacted = false }: NavigationProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (compacted) {
    return (
      <div ref={containerRef} className="flex items-center gap-1">
        {navSections.map((section) => (
          <div key={section.title} className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === section.title ? null : section.title)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 border",
                activeDropdown === section.title 
                  ? "bg-card text-foreground border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]" 
                  : "text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/50 hover:border-border/50"
              )}
            >
              {section.title}
              <CaretDown 
                size={14} 
                weight="bold" 
                className={cn("transition-transform duration-300", activeDropdown === section.title && "rotate-180")} 
              />
            </button>

            {activeDropdown === section.title && (
              <div className="absolute top-full left-0 mt-1 w-48 glass border border-border/50 rounded-lg shadow-xl py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                {section.links.map((link) => (
                  <div key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
                        onClick={() => setActiveDropdown(null)}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="block px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
                        onClick={() => setActiveDropdown(null)}
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Non-compacted mode: Horizontal line of links (headers)
  return (
    <div className="flex items-center gap-8">
      {navSections.map((section) => (
        <div key={section.title} className="group relative">
          <span className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground/60 cursor-default group-hover:text-primary transition-colors">
            {section.title}
          </span>
          
          {/* Subtle underline indicator */}
          <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full" />

          {/* Hover Menu for Landing Page (optional but nice) */}
          <div className="absolute top-full -left-4 mt-2 w-48 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
            <div className="glass border border-border/50 rounded-xl shadow-2xl py-3 px-1">
              {section.links.map((link) => (
                <div key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="block px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
