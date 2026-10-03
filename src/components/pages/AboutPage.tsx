import React from 'react';
import { ActivePage } from '../layout/Header';
import { BackButton } from '../common/BackButton';
import { ShieldCheck, Sparkles, Mail, CheckCircle2, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  setActivePage: (page: ActivePage) => void;
  onBack?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ setActivePage, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <BackButton onBack={onBack} label="Back to Home" />
      </div>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          About QR Code Tools
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          A free, privacy-first web utility for creating, customizing, downloading, and scanning QR codes and barcodes.
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-6">
        <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Our Mission</span>
          </h2>
          <p>
            QR Code Tools was created to provide ordinary users, businesses, educators, and developers with an all-in-one utility that requires no technical hurdles, no account creation, no subscriptions, and no invasive tracking.
          </p>
          <p>
            Many modern QR and barcode websites lock basic features like high-resolution downloads, color customization, or SVG export behind paywalls or forced user logins. QR Code Tools removes all those obstacles, keeping every generator and scanner completely open and free.
          </p>
        </section>

        <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            What You Can Do With QR Code Tools
          </h2>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>QR Code Generator:</strong> Encode website URLs, multi-link series, plain text, Wi-Fi network credentials, email messages, phone numbers, SMS, vCard contact cards, geographical locations, calendar events, WhatsApp chats, and cryptocurrency addresses.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Barcode Generator:</strong> Generate 12 genuine standards including EAN-8, EAN-13, UPC-A, UPC-E, CODE 39, CODE 93, CODE 128, ITF, CODABAR, PDF417, DATA MATRIX, and AZTEC with checksum validation.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Full Customization:</strong> Adjust colors, dot styles, sizes, quiet margins, and embed custom logos with automated high error correction.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>QR & Barcode Scanners:</strong> Decode existing codes by uploading image files (PNG, JPG, SVG) or streaming live video via your phone or laptop camera.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Flexible Export:</strong> Download in vector SVG for industrial print work, or high-res PNG and JPEG for digital use.
              </span>
            </li>
          </ul>
        </section>

        <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Built-in Privacy & Browser Processing</span>
          </h2>
          <p>
            Privacy is a core design pillar. When you type in text, sensitive Wi-Fi credentials, or contact details, the code generation happens locally inside your browser using JavaScript and HTML5 canvas APIs. Your camera feeds and uploaded photos never leave your device.
          </p>
        </section>

        <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            Developer Information
          </h2>
          <p>
            <strong>Developer:</strong> MRS Engineers BD
          </p>
          <p>
            <strong>Contact Email:</strong>{' '}
            <a
              href="mailto:mrs.engineers.bd26@gmail.com"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              mrs.engineers.bd26@gmail.com
            </a>
          </p>
          <p>
            If you have questions, feedback, or suggestions for improvements, feel free to contact us via email.
          </p>
        </section>
      </div>

      <div className="pt-4 flex flex-wrap gap-3">
        <button
          onClick={() => {
            setActivePage('qr-generator');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
        >
          <span>Try QR Generator</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            setActivePage('barcode-generator');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold"
        >
          <span>Try Barcode Generator</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
