import React, { useState } from 'react';
import { ActivePage } from './Header';
import { ArrowUp, Mail, ShieldCheck, QrCode, ExternalLink } from 'lucide-react';
import logoImg from '../../assets/logo.png';

interface FooterProps {
  setActivePage: (page: ActivePage) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActivePage }) => {
  const [logoError, setLogoError] = useState(false);

  const handleNav = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ecosystemLinks = [
    {
      label: 'Official Website & App Hub',
      href: 'https://mrs-engineersbd.blogspot.com/',
    },
    {
      label: 'CodeGuard',
      href: 'https://code-guard.2bd.net/',
    },
    {
      label: 'YouTube',
      href: 'https://youtube.com/@mrs-engineersbd',
    },
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/p/MRS-Engineers-BD-61594304166361/',
    },
    {
      label: 'Telegram',
      href: 'https://t.me/mrsengbd',
    },
    {
      label: 'GitHub',
      href: 'https://github.com/mdrajidul99',
    },
  ];

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 text-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <button
              onClick={() => handleNav('home')}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-blue-600/10 dark:bg-blue-500/10 border border-blue-600/20 shrink-0">
                {!logoError ? (
                  <img
                    src={logoImg}
                    alt="QR Code Tools Logo"
                    onError={() => setLogoError(true)}
                    className="w-7 h-7 object-contain"
                  />
                ) : (
                  <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <span className="text-base font-bold text-neutral-900 dark:text-white">
                QR Code Tools
              </span>
            </button>
            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              Free, modern browser-based QR Code and Barcode toolkit. Generate, customize, download, and scan 12+ barcode standards completely client-side without registration or signup.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% Client-Side Privacy Guaranteed</span>
            </div>
          </div>

          {/* Core Tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Online Tools
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => handleNav('qr-generator')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  QR Code Generator
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('barcode-generator')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Barcode Generator (12 Formats)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('qr-scanner')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  QR Code Scanner (Camera & Upload)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('barcode-scanner')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Barcode Scanner (1D & 2D)
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & About */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Resources & Legal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  About QR Code Tools
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('privacy')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('terms')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          {/* MRS Engineers BD Ecosystem */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              MRS Engineers BD Ecosystem
            </h4>
            <div className="space-y-3 text-xs leading-relaxed">
              <p className="text-neutral-700 dark:text-neutral-300">
                Developed &amp; Maintained by{' '}
                <a
                  href="https://mrs-engineersbd.blogspot.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  MRS Engineers BD
                </a>
              </p>

              <ul className="space-y-2">
                {ecosystemLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <span>{link.label}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                    </a>
                  </li>
                ))}
              </ul>

              <div className="pt-1">
                <a
                  href="mailto:mrs.engineers.bd26@gmail.com"
                  className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline break-all"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>mrs.engineers.bd26@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-neutral-100 dark:border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>
            © 2026 MRS Engineers BD. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              aria-label="Back to top"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
