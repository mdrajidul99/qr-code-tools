import React, { useState } from 'react';
import { Theme } from '../../utils/theme';
import { Sun, Moon, Menu, X, QrCode, Barcode, Scan, Camera } from 'lucide-react';

export type ActivePage =
  | 'home'
  | 'qr-generator'
  | 'barcode-generator'
  | 'qr-scanner'
  | 'barcode-scanner'
  | 'about'
  | 'privacy'
  | 'terms'
  | 'contact';

interface HeaderProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  theme: Theme;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  setActivePage,
  theme,
  toggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const navItems: { id: ActivePage; label: string; icon?: React.ReactNode }[] = [
    { id: 'home', label: 'Home' },
    { id: 'qr-generator', label: 'QR Generator', icon: <QrCode className="w-4 h-4" /> },
    { id: 'barcode-generator', label: 'Barcode Generator', icon: <Barcode className="w-4 h-4" /> },
    { id: 'qr-scanner', label: 'QR Scanner', icon: <Scan className="w-4 h-4" /> },
    { id: 'barcode-scanner', label: 'Barcode Scanner', icon: <Camera className="w-4 h-4" /> },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand & Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg group text-left"
          aria-label="QR Code Tools - Home"
        >
          <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-blue-600/10 dark:bg-blue-500/10 border border-blue-600/20 shrink-0">
            {!logoError ? (
              <img
                src="https://pxdrop.online/raw/db076oq81qec73f6ohi0"
                alt="QR Code Tools Logo"
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
                className="w-8 h-8 object-contain"
              />
            ) : (
              <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap">
            QR Code Tools
          </span>
        </button>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-1 xl:gap-2"
        >
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-neutral-100 dark:bg-neutral-900 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Theme Toggle & Mobile Menu) */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            title={`Toggle ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 text-neutral-700 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 pt-2 pb-6 space-y-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-left ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
