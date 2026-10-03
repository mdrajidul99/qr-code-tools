import React, { useState, useEffect } from 'react';
import { Header, ActivePage } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/pages/HomePage';
import { QrGenerator } from './components/qr/QrGenerator';
import { BarcodeGenerator } from './components/barcode/BarcodeGenerator';
import { QrScanner } from './components/scanner/QrScanner';
import { BarcodeScanner } from './components/scanner/BarcodeScanner';
import { AboutPage } from './components/pages/AboutPage';
import { PrivacyPolicyPage } from './components/pages/PrivacyPolicyPage';
import { TermsPage } from './components/pages/TermsPage';
import { ContactPage } from './components/pages/ContactPage';
import { Toast } from './components/common/Toast';
import { getInitialTheme, applyTheme, Theme } from './utils/theme';

export function App() {
  const [theme, setTheme] = useState<Theme>('light');
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [toast, setToast] = useState<{
    message: string;
    type?: 'success' | 'info' | 'error';
  } | null>(null);

  // Initialize theme
  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  };

  // Sync with browser hash for GitHub Pages navigation & back/forward support
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      const validPages: ActivePage[] = [
        'home',
        'qr-generator',
        'barcode-generator',
        'qr-scanner',
        'barcode-scanner',
        'about',
        'privacy',
        'terms',
        'contact',
      ];
      if (validPages.includes(hash as ActivePage)) {
        setActivePage(hash as ActivePage);
      } else if (!hash) {
        setActivePage('home');
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  const navigateTo = (page: ActivePage) => {
    setActivePage(page);
    window.location.hash = page === 'home' ? '' : `/${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showNotification = (
    message: string,
    type: 'success' | 'info' | 'error' = 'success'
  ) => {
    setToast({ message, type });
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      {/* Top Header */}
      <Header
        activePage={activePage}
        setActivePage={navigateTo}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activePage === 'home' && <HomePage setActivePage={navigateTo} />}
        {activePage === 'qr-generator' && (
          <QrGenerator onNotify={showNotification} onBack={() => navigateTo('home')} />
        )}
        {activePage === 'barcode-generator' && (
          <BarcodeGenerator onNotify={showNotification} onBack={() => navigateTo('home')} />
        )}
        {activePage === 'qr-scanner' && (
          <QrScanner onNotify={showNotification} onBack={() => navigateTo('home')} />
        )}
        {activePage === 'barcode-scanner' && (
          <BarcodeScanner onNotify={showNotification} onBack={() => navigateTo('home')} />
        )}
        {activePage === 'about' && (
          <AboutPage setActivePage={navigateTo} onBack={() => navigateTo('home')} />
        )}
        {activePage === 'privacy' && (
          <PrivacyPolicyPage onBack={() => navigateTo('home')} />
        )}
        {activePage === 'terms' && (
          <TermsPage onBack={() => navigateTo('home')} />
        )}
        {activePage === 'contact' && (
          <ContactPage onNotify={showNotification} onBack={() => navigateTo('home')} />
        )}
      </main>

      {/* Footer */}
      <Footer setActivePage={navigateTo} />

      {/* Global Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
