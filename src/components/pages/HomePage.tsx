import React, { useState } from 'react';
import { ActivePage } from '../layout/Header';
import { AdBanner } from '../common/AdBanner';
import { BARCODE_FORMATS } from '../../utils/barcodeValidators';
import {
  QrCode,
  Barcode,
  Scan,
  Camera,
  ShieldCheck,
  Zap,
  Download,
  Smartphone,
  Eye,
  Check,
  ChevronDown,
  Layers,
  ArrowRight,
  Globe,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface HomePageProps {
  setActivePage: (page: ActivePage) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setActivePage }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleNav = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toolCards = [
    {
      id: 'qr-generator' as ActivePage,
      title: 'QR Code Generator',
      badge: 'Most Popular',
      desc: 'Create personalized QR codes for websites, multi-URLs, Wi-Fi networks, vCards, WhatsApp, and events with color palettes and center logos.',
      icon: <QrCode className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      cta: 'Create QR Code',
    },
    {
      id: 'barcode-generator' as ActivePage,
      title: 'Barcode Generator',
      badge: '12 Formats',
      desc: 'Generate 12 industrial standards including EAN-13, UPC-A, Code 128, ITF-14, PDF417, Data Matrix, and Aztec with checksum validation.',
      icon: <Barcode className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      cta: 'Create Barcode',
    },
    {
      id: 'qr-scanner' as ActivePage,
      title: 'QR Code Scanner',
      badge: 'Camera & Image',
      desc: 'Instantly decode QR codes using your device camera or by uploading an image. Detects Wi-Fi credentials, contact cards, and safe links.',
      icon: <Scan className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      cta: 'Scan QR Code',
    },
    {
      id: 'barcode-scanner' as ActivePage,
      title: 'Barcode Scanner',
      badge: '1D & 2D Codes',
      desc: 'Scan commercial barcodes directly through camera video or uploaded photos. Reads retail products, inventory labels, and transit passes.',
      icon: <Camera className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      cta: 'Scan Barcode',
    },
  ];

  const features = [
    {
      title: 'No Login or Signup Required',
      desc: 'Open the website and use every tool instantly. We never ask for an account, email registration, or subscription fee.',
      icon: <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    },
    {
      title: '100% Client-Side Privacy',
      desc: 'All QR codes and barcodes are rendered and scanned entirely inside your browser. No images or text are stored on any server.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    },
    {
      title: 'High-Resolution & Vector SVG',
      desc: 'Download crisp vector SVGs for commercial packaging and printing, or high-definition PNG and JPEG formats for digital sharing.',
      icon: <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    },
    {
      title: 'Mobile-First & Camera Ready',
      desc: 'Built with responsive touch-friendly controls. Switch cameras seamlessly on iOS Safari, Android Chrome, and laptops.',
      icon: <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    },
    {
      title: 'Full Visual Customization',
      desc: 'Customize foreground and background colors, dot module patterns, quiet margins, error correction, and embed your brand logo.',
      icon: <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    },
    {
      title: '12+ Barcode Standards',
      desc: 'From global retail EAN/UPC to logistics Code 128 and 2D Data Matrix, all standard symbologies are genuinely encoded and verified.',
      icon: <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    },
  ];

  const faqs = [
    {
      q: 'Is QR Code Tools completely free to use?',
      a: 'Yes, 100% free! You can generate, customize, download, and scan unlimited QR codes and barcodes without any fee, watermark, or hidden charge.',
    },
    {
      q: 'Do I need to create an account or sign in?',
      a: 'No. There is zero registration, login, or account creation required. You have immediate access to all tools from the moment you open the site.',
    },
    {
      q: 'Can I add multiple URLs or phone numbers to a QR code?',
      a: 'Yes! Our QR Generator includes dedicated "Add Another URL" and "Add Another Phone" buttons. You can generate individual codes for each item with one-click preview and download, or combine them into a clean list.',
    },
    {
      q: 'Does the website store or upload my data?',
      a: 'Never. All generation, camera processing, and image decoding occur purely on your local machine using standard browser APIs and client-side JavaScript. Your Wi-Fi passwords, contact details, and uploaded images never leave your browser.',
    },
    {
      q: 'What image formats can I upload to the scanners?',
      a: 'The QR Code Scanner and Barcode Scanner accept PNG, JPG, JPEG, SVG, and WEBP image files via drag-and-drop or file upload.',
    },
    {
      q: 'Which barcode formats are supported?',
      a: 'We genuinely support 12 major standards: EAN-8, EAN-13, UPC-A, UPC-E, CODE 39, CODE 93, CODE 128, ITF (Interleaved 2 of 5), CODABAR, PDF417, DATA MATRIX, and AZTEC.',
    },
    {
      q: 'Why might a customized QR code fail to scan?',
      a: 'Scanning reliability depends heavily on color contrast. A dark code on a light background works best. If you choose low contrast (e.g. light gray on white) or insert a center logo without High (H) error correction, some cameras may struggle to decode it.',
    },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-6 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>100% Free · No Registration · Instant Browser Generation</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
          Create, Customize & Scan QR Codes and Barcodes Easily
        </h1>

        <p className="mt-5 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          The all-in-one privacy-first toolkit for everyone. Generate custom QR codes and 12+ barcode formats, scan from your camera or image files, and export in crisp vector SVG and high-res PNG.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => handleNav('qr-generator')}
            className="flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all hover:scale-[1.02]"
          >
            <QrCode className="w-4 h-4" />
            <span>Create QR Code</span>
          </button>
          <button
            onClick={() => handleNav('barcode-generator')}
            className="flex items-center gap-2 px-5 py-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-sm font-semibold shadow-sm transition-all hover:scale-[1.02]"
          >
            <Barcode className="w-4 h-4" />
            <span>Create Barcode</span>
          </button>
          <button
            onClick={() => handleNav('qr-scanner')}
            className="flex items-center gap-2 px-5 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-sm font-semibold transition-all hover:scale-[1.02]"
          >
            <Scan className="w-4 h-4" />
            <span>Scan QR Code</span>
          </button>
          <button
            onClick={() => handleNav('barcode-scanner')}
            className="flex items-center gap-2 px-5 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-sm font-semibold transition-all hover:scale-[1.02]"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Barcode</span>
          </button>
        </div>
      </section>

      {/* Main 4 Tool Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Core Toolkit Modules
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Select an online tool below to get started immediately
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {toolCards.map((card) => (
            <div
              key={card.id}
              className="group bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col justify-between hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {card.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400 mb-6">
                  {card.desc}
                </p>
              </div>

              <button
                onClick={() => handleNav(card.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-neutral-100 hover:bg-blue-600 dark:bg-neutral-800 dark:hover:bg-blue-600 text-neutral-800 hover:text-white dark:text-neutral-200 dark:hover:text-white text-xs font-semibold transition-colors"
              >
                <span>{card.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Subtle Ad Unit 1 Between Sections */}
      <AdBanner unit={1} />

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Engineered for Simplicity & Privacy
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Professional browser tools built with strict privacy standards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3"
            >
              <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                {feat.icon}
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                {feat.title}
              </h3>
              <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works: 3 Simple Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 sm:p-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              How It Works in 3 Steps
            </h2>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Generate or decode codes in under 10 seconds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto text-sm">
                1
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Select Your Tool
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Choose between the QR Code Generator, Barcode Generator, QR Scanner, or Barcode Scanner.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto text-sm">
                2
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Enter Data or Scan
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Fill in your links, phone numbers, or Wi-Fi info, or upload an existing barcode photo or launch your camera.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto text-sm">
                3
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Download or Copy
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Customize colors and formats, then export your PNG/SVG file or copy decoded results with a single click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Barcode Formats Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            12 Supported Barcode Formats
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Real standards used across global retail, supply chain, and government identification
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.values(BARCODE_FORMATS).map((fmt) => (
            <div
              key={fmt.id}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  {fmt.name}
                </span>
                <span className="text-[10px] text-neutral-400 uppercase font-mono">
                  {fmt.category}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
                {fmt.description}
              </p>
              <div className="pt-1 text-[10px] text-blue-600 dark:text-blue-400 font-medium truncate">
                {fmt.industry.split(',')[0]}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Answers to common questions about QR Code Tools
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 transition-transform ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Subtle Ad Unit 2 Before Footer */}
      <AdBanner unit={2} />
    </div>
  );
};
