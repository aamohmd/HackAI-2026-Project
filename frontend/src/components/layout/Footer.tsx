import { Link } from 'react-router-dom';
import { useRef } from 'react';

interface FooterProps {
  variant?: 'landing' | 'dashboard';
}

export function Footer({ variant = 'landing' }: FooterProps) {
  const isDashboard = variant === 'dashboard';
  const containerRef = useRef<HTMLDivElement>(null);

  const sections = [
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

  return (
    <footer ref={containerRef} className={`relative ${isDashboard ? 'mt-auto py-12 border-t border-border/30 bg-background/30' : 'pt-24 pb-12 px-4 border-t border-border/50 glass'}`}>
      {/* Seamless Wide Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-48 md:w-64">
        {/* The Notch Body */}
        <div className={`relative h-10 w-full rounded-t-[2rem] border-x border-t flex items-center justify-center ${isDashboard ? 'border-border/30 bg-background/30 backdrop-blur-sm' : 'border-border/50 glass'}`}>
          
          {/* Seamless Transition Curves */}
          <div className={`absolute -bottom-[1px] -left-[20px] w-[20px] h-[20px] pointer-events-none overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-[40px] h-[40px] rounded-full border-r border-b ${isDashboard ? 'border-border/30' : 'border-border/50'}`} style={{ clipPath: 'inset(50% 0 0 50%)' }} />
          </div>
          <div className={`absolute -bottom-[1px] -right-[20px] w-[20px] h-[20px] pointer-events-none overflow-hidden`}>
            <div className={`absolute top-0 left-0 w-[40px] h-[40px] rounded-full border-l border-b ${isDashboard ? 'border-border/30' : 'border-border/50'}`} style={{ clipPath: 'inset(50% 50% 0 0)' }} />
          </div>

          <div className="flex items-center gap-2 text-[12px] font-bold tracking-[0.15em] text-muted-foreground/90 uppercase">
            <span>HackAI</span>
            <span className="font-black italic">X</span>
            <span>1337</span>
          </div>

          {/* Masking the border at the bottom of the notch to make it seamless */}
          <div className="absolute -bottom-[1px] left-0 w-full h-[2px] bg-background/0 z-10" />
        </div>
      </div>

      {!isDashboard && (
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      )}

      <div className={`max-w-7xl mx-auto ${isDashboard ? 'px-4 md:px-8' : 'px-4 md:px-8'}`}>
        {isDashboard ? (
          /* Simplified Dashboard Layout */
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-4">
            <p className="text-[10px] text-muted-foreground/30 font-medium tracking-[0.25em] uppercase">
              © 2026 All Rights Reserved
            </p>
          </div>
        ) : (
          /* Expanded Landing Layout */
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
              {sections.map((section, idx) => (
                <div key={section.title} className={`space-y-6 ${idx === 1 ? 'md:text-center' : idx === 2 ? 'md:text-right' : ''}`}>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                    {section.title}
                  </h4>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        {link.external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-all relative group inline-block"
                          >
                            {link.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all group-hover:w-full" />
                          </a>
                        ) : (
                          <Link
                            to={link.href}
                            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-all relative group inline-block"
                          >
                            {link.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all group-hover:w-full" />
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-border/10 flex flex-col items-center">
              <p className="text-[10px] text-muted-foreground/30 font-medium tracking-[0.25em] uppercase">
                © 2026 All Rights Reserved
              </p>
            </div>
          </>
        )}
      </div>
    </footer>
  );
}
