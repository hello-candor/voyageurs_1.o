
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Sun, Moon, Anchor, Ticket, User, Compass } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useAppConfig } from '../context/AppConfigContext';
import { SearchOverlay } from './SearchOverlay';

const publicLinks = [
  { name: 'Destination', href: '#montpellier-info', subtitle: 'La Douée' },
  { name: 'Travel', href: '#logistics', subtitle: 'Logistics' },
  { name: 'Occasion', href: '#celebration', subtitle: 'Itinerary' },
  { name: 'Atmosphere', href: '#gallery', subtitle: 'Gallery' },
  { name: 'Join', href: '#rsvp', subtitle: 'Guest Entry', isAction: true },
];

export const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [manualScroll, setManualScroll] = useState(false); 

  const { theme, toggleTheme } = useTheme();
  const { user, hasRSVPd, setAuthMode, toggleProfile } = useUser();
  const { config } = useAppConfig();
  const manualScrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter links: Hide Join from nav list if user is not logged in (combined into main CTA)
  const displayedLinks = publicLinks.filter(link => {
      if (link.isAction && !user) return false;
      return true;
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;
      setIsScrolled(scrollY > 20);
      const progress = Math.min(Math.max(scrollY / (maxScroll || 1), 0), 1);
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (manualScroll) return; 
    const observerOptions = { root: null, rootMargin: '-20% 0px -50% 0px', threshold: [0, 0.1, 0.5] };
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const visibleEntries = entries.filter(entry => entry.isIntersecting);
      if (visibleEntries.length > 0) {
          const mostVisible = visibleEntries.reduce((prev, current) => 
            (prev.intersectionRatio > current.intersectionRatio) ? prev : current
          );
          setActiveSection(mostVisible.target.id);
      }
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sectionsToObserve = ['montpellier-info', 'logistics', 'celebration', 'gallery', 'home'];
    sectionsToObserve.forEach(id => {
       const element = document.getElementById(id);
       if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [manualScroll]);

  const scrollToSection = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
          setManualScroll(true);
          setActiveSection(id); 
          
          const isMobile = window.innerWidth < 1024;
          const navHeight = isMobile ? 80 : 100; 
          
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - navHeight;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
          
          if (manualScrollTimeout.current) clearTimeout(manualScrollTimeout.current);
          manualScrollTimeout.current = setTimeout(() => setManualScroll(false), 1000);
      } else if (id === 'home') {
          window.scrollTo({ top: 0, behavior: "smooth" });
          setActiveSection('home');
      }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, link: typeof publicLinks[0]) => {
      e.preventDefault();
      setIsMobileMenuOpen(false);

      if (link.isAction) {
          setAuthMode('rsvp');
          toggleProfile();
          return;
      }

      const id = link.href.substring(1);
      scrollToSection(id);
  };

  const handleRSVPAction = () => {
      setAuthMode(user ? 'login' : 'rsvp');
      toggleProfile();
  };

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - scrollProgress * circumference;

  return (
    <>
    {/* Top Navigation Bar */}
    <nav 
      className={`fixed top-0 left-0 right-0 z-[120] flex justify-center pointer-events-none transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
        isScrolled ? 'py-2 lg:py-4 px-2 md:px-4' : 'py-6 md:py-10 px-4 md:px-8'
      }`}
      aria-label="Main Navigation"
    >
      <div 
        className={`
            pointer-events-auto relative w-full
            transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
            backdrop-blur-2xl border
            ${isScrolled 
                ? 'max-w-5xl bg-white/90 dark:bg-gray-900/90 border-white/20 dark:border-white/10 shadow-2xl rounded-[2rem] p-3' 
                : 'max-w-7xl bg-white/10 dark:bg-black/20 border-white/10 dark:border-white/5 rounded-[2rem] p-4 shadow-none'
            }
        `}
      >
        {/* CSS Grid Layout for precise placement without absolute positioning */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
            
            {/* Left: Brand */}
            <div className="flex items-center justify-start">
                <a 
                    href="#home" 
                    onClick={(e) => {
                        e.preventDefault();
                        scrollToSection('home');
                    }}
                    className="flex items-center gap-2 md:gap-4 group relative z-10"
                >
                    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                        <svg className={`absolute inset-0 transform -rotate-90 transition-opacity duration-500 ${isScrolled ? 'opacity-100' : 'opacity-0'}`} width="100%" height="100%" viewBox="0 0 40 40">
                            <circle stroke="currentColor" strokeWidth="2.5" fill="transparent" r={radius} cx="20" cy="20" className="text-gray-200 dark:text-gray-700" />
                            <circle stroke="currentColor" strokeWidth="2.5" fill="transparent" r={radius} cx="20" cy="20" className="text-med-terracotta transition-all duration-300 ease-out" style={{ strokeDasharray: circumference, strokeDashoffset }} />
                        </svg>
                        <div className={`w-full h-full flex items-center justify-center rounded-full transition-all duration-500 ${isScrolled ? 'bg-transparent text-med-blue dark:text-white' : 'bg-white text-med-blue shadow-lg'}`}>
                            <Anchor size={isScrolled ? 16 : 18} />
                        </div>
                    </div>
                    
                    {/* Brand Text - Responsive visibility */}
                    <div className={`flex flex-col leading-none transition-all duration-500 origin-left overflow-hidden ${isScrolled ? 'w-0 opacity-0 md:w-auto md:opacity-100' : 'w-auto opacity-100'}`}>
                        <span className={`font-serif font-bold text-lg md:text-xl tracking-tight whitespace-nowrap transition-colors duration-500 ${isScrolled ? 'text-med-blue dark:text-white' : 'text-white'}`}>{config.appName}</span>
                        <span className={`text-[8px] uppercase tracking-[0.3em] font-bold whitespace-nowrap transition-colors duration-500 ${isScrolled ? 'text-med-blue/60 dark:text-white/60' : 'text-white/80'}`}>{config.destination}</span>
                    </div>
                </a>
            </div>

            {/* Center: Desktop Links */}
            <div className="hidden lg:flex justify-center items-center">
                <div className={`flex p-1 gap-1 rounded-full transition-colors duration-500 ${isScrolled ? 'bg-gray-100/50 dark:bg-gray-800/50' : ''}`}>
                    {displayedLinks.map((link) => {
                        const isActive = activeSection === link.href.substring(1);
                        
                        if (link.isAction) {
                            return (
                                <button
                                    key={link.name}
                                    onClick={(e) => handleNavClick(e, link)}
                                    className={`relative px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${isScrolled ? 'text-gray-500 hover:text-med-terracotta dark:text-gray-400' : 'text-white/70 hover:text-white'}`}
                                >
                                    <Ticket size={14} className={isScrolled ? "text-med-terracotta" : "text-white"} />
                                    <span className="relative z-10">{link.name}</span>
                                </button>
                            );
                        }

                        return (
                            <a key={link.name} href={link.href} onClick={(e) => handleNavClick(e, link)} className={`relative px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center whitespace-nowrap ${isActive ? 'text-med-blue dark:text-white' : isScrolled ? 'text-gray-500 hover:text-med-blue dark:text-gray-400' : 'text-white/70 hover:text-white'}`}>
                                {isActive && <span className={`absolute inset-0 rounded-full shadow-sm transition-all duration-300 ${isScrolled ? 'bg-white dark:bg-gray-700' : 'bg-white/20 backdrop-blur-md'}`}></span>}
                                <span className="relative z-10">{link.name}</span>
                            </a>
                        );
                    })}
                </div>
            </div>

            {/* Right: Actions & Mobile Toggle */}
            <div className="flex items-center justify-end gap-2 md:gap-3">
                <button 
                    onClick={toggleTheme} 
                    className={`hidden lg:flex w-9 h-9 rounded-full items-center justify-center transition-all duration-300 ${isScrolled ? 'text-gray-400 hover:text-med-blue hover:bg-gray-100 dark:hover:bg-gray-800' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                
                <div className={`h-5 w-px hidden lg:block transition-colors duration-500 ${isScrolled ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white/20'}`}></div>
                
                {/* Right-side Action Button - Shows on all screen sizes, adapts text */}
                {user ? (
                  <button 
                      onClick={handleRSVPAction} 
                      className={`group flex items-center gap-2 pl-4 pr-5 py-2 md:py-2.5 rounded-full transition-all duration-300 font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95 whitespace-nowrap
                      ${isScrolled ? 'bg-med-terracotta text-white hover:bg-med-blue' : 'bg-med-terracotta text-white hover:bg-[#c56143]'}
                      `}
                  >
                      <User size={14} />
                      <span className="hidden sm:inline">{hasRSVPd ? "Hub" : "Account"}</span>
                      <span className="sm:hidden">Hub</span>
                  </button>
                ) : (
                  <a 
                      href="/rsvp" 
                      className={`group flex items-center gap-2 pl-4 pr-5 py-2 md:py-2.5 rounded-full transition-all duration-300 font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95 whitespace-nowrap
                      ${isScrolled ? 'bg-med-terracotta text-white hover:bg-med-blue' : 'bg-med-terracotta text-white hover:bg-[#c56143]'}
                      `}
                  >
                      <Ticket size={14} className={!isScrolled ? "animate-pulse" : ""} />
                      <span className="hidden sm:inline">RSVP</span>
                      <span className="sm:hidden">RSVP</span>
                  </a>
                )}
                
                {/* Mobile/Tablet Hamburger - Only visible on screens smaller than LG */}
                <button 
                    onClick={() => setIsMobileMenuOpen(true)} 
                    className={`lg:hidden w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                        ${isScrolled ? 'bg-gray-100 dark:bg-gray-800 text-med-blue dark:text-white' : 'bg-white/10 text-white'}`}
                    aria-label="Menu"
                >
                    <Menu size={20} />
                </button>
            </div>
        </div>
      </div>
    </nav>

    {/* Mobile Menu Overlay */}
    <div className={`fixed inset-0 z-[150] bg-med-blue/95 dark:bg-black/95 backdrop-blur-3xl transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${isMobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="flex flex-col h-full p-8 relative">
            <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3 text-white">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"><Anchor size={20} /></div>
                    <span className="font-serif text-2xl font-bold">Menu</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white"><X size={24} /></button>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-6">
                {displayedLinks.map((link, idx) => (
                    <button 
                        key={link.name} 
                        onClick={(e) => handleNavClick(e, link)} 
                        className="group flex flex-col pl-4 border-l-2 border-white/10 hover:border-med-terracotta transition-colors duration-300 text-left"
                    >
                        <span className="text-med-terracotta text-[10px] font-bold uppercase tracking-[0.3em] mb-1.5 opacity-60">0{idx + 1} — {link.subtitle}</span>
                        <span className="font-serif text-3xl md:text-4xl text-white group-hover:translate-x-2 transition-transform duration-300 flex items-center gap-3">
                            {link.name} {link.isAction && <Ticket size={24} className="opacity-50" />}
                        </span>
                    </button>
                ))}
                {!user && (
                    <button 
                        onClick={() => { setIsMobileMenuOpen(false); setAuthMode('rsvp'); toggleProfile(); }}
                        className="group flex flex-col pl-4 border-l-2 border-white/10 hover:border-med-terracotta transition-colors duration-300 text-left"
                    >
                        <span className="text-med-terracotta text-[10px] font-bold uppercase tracking-[0.3em] mb-1.5 opacity-60">0{displayedLinks.length + 1} — INVITATION</span>
                        <span className="font-serif text-3xl md:text-4xl text-white group-hover:translate-x-2 transition-transform duration-300 flex items-center gap-3">
                            Guest Entry <Ticket size={24} className="opacity-50" />
                        </span>
                    </button>
                )}
            </div>
            <div className="pt-8 border-t border-white/10">
                <button onClick={toggleTheme} className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl bg-white/5 text-white border border-white/5">
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    <span className="text-xs font-bold uppercase tracking-widest">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
            </div>
        </div>
    </div>
    <SearchOverlay isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
};
