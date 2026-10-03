import React, { useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrType,
  ErrorCorrectionLevel,
  QrOptions,
  WifiData,
  EmailData,
  SmsData,
  VCardData,
  LocationData,
  EventData,
  WhatsAppData,
  CryptoData,
} from '../../types/qr';
import { formatQrPayload } from '../../utils/qrFormatter';
import {
  downloadCanvas,
  downloadSvgString,
  copyCanvasToClipboard,
  copyTextToClipboard,
} from '../../utils/downloadUtils';
import { BackButton } from '../common/BackButton';
import {
  Link as LinkIcon,
  Type,
  Wifi,
  Mail,
  Phone,
  MessageSquare,
  User,
  MapPin,
  Calendar,
  Send,
  Coins,
  Download,
  Copy,
  RotateCcw,
  Plus,
  Trash2,
  AlertTriangle,
  Image as ImageIcon,
  Check,
  QrCode,
  Sparkles,
} from 'lucide-react';

interface QrGeneratorProps {
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onBack?: () => void;
}

export const QrGenerator: React.FC<QrGeneratorProps> = ({ onNotify, onBack }) => {
  // QR Type
  const [qrType, setQrType] = useState<QrType>('url');

  // Input states - CLEAN / EMPTY INITIAL STATE (No dummy data)
  const [singleUrl, setSingleUrl] = useState('');
  const [urls, setUrls] = useState<string[]>(['']);
  const [selectedMultiUrlIndex, setSelectedMultiUrlIndex] = useState(0);

  const [text, setText] = useState('');

  const [wifi, setWifi] = useState<WifiData>({
    ssid: '',
    password: '',
    encryption: 'WPA',
    hidden: false,
  });

  const [email, setEmail] = useState<EmailData>({
    email: '',
    subject: '',
    body: '',
  });

  const [singlePhone, setSinglePhone] = useState('');
  const [phones, setPhones] = useState<string[]>(['']);
  const [selectedMultiPhoneIndex, setSelectedMultiPhoneIndex] = useState(0);

  const [sms, setSms] = useState<SmsData>({
    phone: '',
    message: '',
  });

  const [vcard, setVcard] = useState<VCardData>({
    firstName: '',
    lastName: '',
    organization: '',
    jobTitle: '',
    phone: '',
    email: '',
    website: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    notes: '',
  });

  const [location, setLocation] = useState<LocationData>({
    latitude: '',
    longitude: '',
    query: '',
  });

  const [eventData, setEventData] = useState<EventData>({
    title: '',
    startDateTime: '',
    endDateTime: '',
    location: '',
    description: '',
  });

  const [whatsapp, setWhatsapp] = useState<WhatsAppData>({
    phone: '',
    message: '',
  });

  const [crypto, setCrypto] = useState<CryptoData>({
    coin: 'bitcoin',
    address: '',
    amount: '',
    label: '',
  });

  // Customization Options
  const [options, setOptions] = useState<QrOptions>({
    fgColor: '#000000',
    bgColor: '#ffffff',
    size: 400,
    margin: 2,
    errorCorrectionLevel: 'M',
    dotStyle: 'square',
    logoSize: 20,
  });

  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  // Active Multi-Mode Toggle
  const [multiMode, setMultiMode] = useState<'individual' | 'combined'>('individual');

  // Preview & Generation States
  const [isGenerated, setIsGenerated] = useState(false);
  const [activePayload, setActivePayload] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [contrastWarning, setContrastWarning] = useState<string | null>(null);

  // QR Types configuration list
  const typeTabs: { id: QrType; label: string; icon: React.ReactNode }[] = [
    { id: 'url', label: 'URL / Link', icon: <LinkIcon className="w-4 h-4" /> },
    { id: 'text', label: 'Text', icon: <Type className="w-4 h-4" /> },
    { id: 'wifi', label: 'Wi-Fi', icon: <Wifi className="w-4 h-4" /> },
    { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { id: 'phone', label: 'Phone', icon: <Phone className="w-4 h-4" /> },
    { id: 'sms', label: 'SMS', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'vcard', label: 'vCard Contact', icon: <User className="w-4 h-4" /> },
    { id: 'location', label: 'Location', icon: <MapPin className="w-4 h-4" /> },
    { id: 'event', label: 'Calendar Event', icon: <Calendar className="w-4 h-4" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <Send className="w-4 h-4" /> },
    { id: 'crypto', label: 'Crypto', icon: <Coins className="w-4 h-4" /> },
  ];

  // Quick Color Presets
  const colorPresets = [
    { label: 'Black / White', fg: '#000000', bg: '#ffffff' },
    { label: 'Navy / White', fg: '#1e3a8a', bg: '#ffffff' },
    { label: 'Emerald / Mint', fg: '#064e3b', bg: '#ecfdf5' },
    { label: 'Purple / Light', fg: '#581c87', bg: '#faf5ff' },
    { label: 'Slate / Silver', fg: '#0f172a', bg: '#f1f5f9' },
    { label: 'Burgundy / Cream', fg: '#4c0519', bg: '#fff1f2' },
  ];

  // Validation function before generating
  const validateInputs = (): { valid: boolean; error?: string } => {
    switch (qrType) {
      case 'url': {
        if (urls.length > 1) {
          if (multiMode === 'individual') {
            const activeU = (urls[selectedMultiUrlIndex] !== undefined ? urls[selectedMultiUrlIndex] : urls[0] || '').trim();
            if (!activeU || activeU === 'http://' || activeU === 'https://') {
              return { valid: false, error: `Please enter a valid website URL for URL #${selectedMultiUrlIndex + 1}.` };
            }
          } else {
            const filled = urls.filter((u) => u.trim().length > 0 && u.trim() !== 'http://' && u.trim() !== 'https://');
            if (filled.length === 0) {
              return { valid: false, error: 'Please enter at least one valid website URL.' };
            }
          }
        } else {
          const val = (urls[0] !== undefined ? urls[0] : singleUrl).trim();
          if (!val || val === 'http://' || val === 'https://') {
            return { valid: false, error: 'Please enter a valid website URL.' };
          }
        }
        return { valid: true };
      }
      case 'text': {
        if (!text.trim()) {
          return { valid: false, error: 'Please enter some text to generate your QR Code.' };
        }
        return { valid: true };
      }
      case 'wifi': {
        if (!wifi.ssid.trim()) {
          return { valid: false, error: 'Please enter the Wi-Fi network name (SSID).' };
        }
        return { valid: true };
      }
      case 'email': {
        if (!email.email.trim()) {
          return { valid: false, error: 'Please enter a recipient email address.' };
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.email.trim())) {
          return { valid: false, error: 'Please enter a valid email address format.' };
        }
        return { valid: true };
      }
      case 'phone': {
        if (phones.length > 1) {
          if (multiMode === 'individual') {
            const activeP = (phones[selectedMultiPhoneIndex] !== undefined ? phones[selectedMultiPhoneIndex] : phones[0] || '').trim().replace(/[^0-9]/g, '');
            if (activeP.length < 3) {
              return { valid: false, error: `Please enter a valid phone number (at least 3 digits) for Phone #${selectedMultiPhoneIndex + 1}.` };
            }
          } else {
            const filled = phones.filter((p) => p.trim().replace(/[^0-9]/g, '').length >= 3);
            if (filled.length === 0) {
              return { valid: false, error: 'Please enter at least one valid phone number.' };
            }
          }
        } else {
          const digits = (phones[0] !== undefined ? phones[0] : singlePhone).trim().replace(/[^0-9]/g, '');
          if (digits.length < 3) {
            return { valid: false, error: 'Please enter a valid phone number (at least 3 digits).' };
          }
        }
        return { valid: true };
      }
      case 'sms': {
        const digits = sms.phone.trim().replace(/[^0-9]/g, '');
        if (digits.length < 3) {
          return { valid: false, error: 'Please enter a valid phone number for SMS.' };
        }
        return { valid: true };
      }
      case 'vcard': {
        if (!vcard.firstName.trim() && !vcard.lastName.trim() && !vcard.organization.trim() && !vcard.phone.trim() && !vcard.email.trim()) {
          return { valid: false, error: 'Please enter at least a name, phone, or email for the contact.' };
        }
        return { valid: true };
      }
      case 'location': {
        if (!location.latitude.trim() && !location.longitude.trim() && !location.query.trim()) {
          return { valid: false, error: 'Please enter latitude & longitude or search address.' };
        }
        return { valid: true };
      }
      case 'event': {
        if (!eventData.title.trim()) {
          return { valid: false, error: 'Please enter an event title.' };
        }
        return { valid: true };
      }
      case 'whatsapp': {
        const digits = whatsapp.phone.trim().replace(/[^0-9]/g, '');
        if (digits.length < 4) {
          return { valid: false, error: 'Please enter a valid phone number with country code.' };
        }
        return { valid: true };
      }
      case 'crypto': {
        if (!crypto.address.trim()) {
          return { valid: false, error: 'Please enter a cryptocurrency wallet address.' };
        }
        return { valid: true };
      }
      default:
        return { valid: true };
    }
  };

  // Compute final payload string based on current type and inputs
  const computePayload = (): string => {
    if (qrType === 'url') {
      if (urls.length > 1 && multiMode === 'individual') {
        const u = (urls[selectedMultiUrlIndex] !== undefined ? urls[selectedMultiUrlIndex] : urls[0] || '').trim();
        return !/^https?:\/\//i.test(u) && u ? `https://${u}` : u;
      }
      if (urls.length > 1 && multiMode === 'combined') {
        return urls
          .map((u) => u.trim())
          .filter((u) => u.length > 0 && u !== 'http://' && u !== 'https://')
          .map((u) => (!/^https?:\/\//i.test(u) ? `https://${u}` : u))
          .join('\n');
      }
      const raw = (urls[0] !== undefined ? urls[0] : singleUrl).trim();
      if (!raw) return '';
      return !/^https?:\/\//i.test(raw) ? `https://${raw}` : raw;
    }

    if (qrType === 'phone') {
      if (phones.length > 1 && multiMode === 'individual') {
        const p = (phones[selectedMultiPhoneIndex] !== undefined ? phones[selectedMultiPhoneIndex] : phones[0] || '').trim().replace(/[^0-9+]/g, '');
        return p ? `tel:${p}` : '';
      }
      if (phones.length > 1 && multiMode === 'combined') {
        return phones
          .map((p) => p.trim().replace(/[^0-9+]/g, ''))
          .filter((p) => p.length >= 3)
          .map((p) => `tel:${p}`)
          .join('\n');
      }
      const p = (phones[0] !== undefined ? phones[0] : singlePhone).trim().replace(/[^0-9+]/g, '');
      return p ? `tel:${p}` : '';
    }

    return formatQrPayload(qrType, {
      url: singleUrl,
      urls,
      text,
      wifi,
      email,
      phone: singlePhone,
      phones,
      sms,
      vcard,
      location,
      event: eventData,
      whatsapp,
      crypto,
    });
  };

  // Contrast check helper
  const checkContrast = (fgHex: string, bgHex: string) => {
    const hexToRgb = (hex: string) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 };
    };

    const getLuminance = (rgb: { r: number; g: number; b: number }) => {
      const a = [rgb.r, rgb.g, rgb.b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const fgRgb = hexToRgb(fgHex);
    const bgRgb = hexToRgb(bgHex);
    const lum1 = getLuminance(fgRgb);
    const lum2 = getLuminance(bgRgb);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    const ratio = (brightest + 0.05) / (darkest + 0.05);

    if (ratio < 3.0) {
      setContrastWarning('Low color contrast! This QR code may be difficult for some cameras to scan.');
    } else if (lum1 > lum2) {
      setContrastWarning('Inverted colors (light QR on dark background) may not be recognized by older scanners.');
    } else {
      setContrastWarning(null);
    }
  };

  // Core drawing logic onto HTMLCanvasElement
  const drawQrCode = (payload: string, currentOptions: QrOptions): boolean => {
    checkContrast(currentOptions.fgColor, currentOptions.bgColor);
    const canvas = canvasRef.current;
    if (!canvas) {
      setErrorMsg('Canvas rendering target unavailable. Please try again.');
      return false;
    }

    if (!payload.trim()) {
      setErrorMsg('Please enter valid information to generate your QR Code.');
      return false;
    }

    try {
      const qrData = QRCode.create(payload, {
        errorCorrectionLevel: logoImage ? 'H' : currentOptions.errorCorrectionLevel,
      });

      const moduleCount = qrData.modules.size;
      const marginModules = currentOptions.margin;
      const totalModules = moduleCount + marginModules * 2;
      const cellSize = currentOptions.size / totalModules;

      canvas.width = currentOptions.size;
      canvas.height = currentOptions.size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;

      // Draw background
      ctx.fillStyle = currentOptions.bgColor;
      ctx.fillRect(0, 0, currentOptions.size, currentOptions.size);

      // Check if finder pattern in 3 corners (7x7 modules)
      const isFinderPattern = (r: number, c: number): boolean => {
        if (r < 7 && c < 7) return true;
        if (r < 7 && c >= moduleCount - 7) return true;
        if (r >= moduleCount - 7 && c < 7) return true;
        return false;
      };

      ctx.fillStyle = currentOptions.fgColor;

      // Draw modules
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (qrData.modules.get(r, c)) {
            const x = (c + marginModules) * cellSize;
            const y = (r + marginModules) * cellSize;

            if (currentOptions.dotStyle === 'dots' && !isFinderPattern(r, c)) {
              ctx.beginPath();
              ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.44, 0, Math.PI * 2);
              ctx.fill();
            } else if (currentOptions.dotStyle === 'rounded' && !isFinderPattern(r, c)) {
              const radius = cellSize * 0.35;
              ctx.beginPath();
              ctx.roundRect(x, y, cellSize, cellSize, radius);
              ctx.fill();
            } else {
              ctx.fillRect(x, y, Math.ceil(cellSize), Math.ceil(cellSize));
            }
          }
        }
      }

      // Draw center logo if present
      if (logoImage) {
        const logoPercent = Math.min(Math.max(currentOptions.logoSize, 10), 28) / 100;
        const logoDimension = currentOptions.size * logoPercent;
        const logoX = (currentOptions.size - logoDimension) / 2;
        const logoY = (currentOptions.size - logoDimension) / 2;

        ctx.fillStyle = currentOptions.bgColor;
        const padding = cellSize;
        ctx.beginPath();
        ctx.roundRect(
          logoX - padding,
          logoY - padding,
          logoDimension + padding * 2,
          logoDimension + padding * 2,
          8
        );
        ctx.fill();

        ctx.drawImage(logoImage, logoX, logoY, logoDimension, logoDimension);
      }

      setErrorMsg(null);
      return true;
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMsg(errObj?.message || 'Failed to render QR Code. Input data may be too long for this error correction level.');
      return false;
    }
  };

  // EXPLICIT ACTION: User clicks "Create QR Code" (NO ENTER REQUIRED)
  const handleCreateQr = () => {
    const validation = validateInputs();
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Please fill in the required fields.');
      onNotify(validation.error || 'Please fill in the required fields.', 'error');
      return;
    }

    const payload = computePayload();
    if (!payload || !payload.trim()) {
      setErrorMsg('Please enter your information first before creating a QR Code.');
      onNotify('Please enter your information first.', 'error');
      return;
    }

    const success = drawQrCode(payload, options);
    if (success) {
      setActivePayload(payload);
      setIsGenerated(true);
      setErrorMsg(null);
      onNotify('QR Code generated successfully!', 'success');
      if (window.innerWidth < 1024 && canvasRef.current) {
        canvasRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  // When customization options change after code has already been generated, re-render smoothly
  const updateOptionsAndRerender = (newOptions: QrOptions) => {
    setOptions(newOptions);
    if (isGenerated && activePayload) {
      drawQrCode(activePayload, newOptions);
    }
  };

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onNotify('Please upload a valid image file (PNG, JPG, SVG).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLogoDataUrl(result);
      const img = new Image();
      img.onload = () => {
        setLogoImage(img);
        const updated = { ...options, errorCorrectionLevel: 'H' as ErrorCorrectionLevel };
        setOptions(updated);
        if (isGenerated && activePayload) {
          drawQrCode(activePayload, updated);
        }
        onNotify('Logo loaded! Error correction set to High for reliable scanning.', 'info');
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoImage(null);
    setLogoDataUrl(null);
    if (isGenerated && activePayload) {
      drawQrCode(activePayload, options);
    }
    onNotify('Logo removed.', 'info');
  };

  // Downloads (PNG, SVG, JPG)
  const handleDownload = (format: 'png' | 'jpeg' | 'svg') => {
    if (!isGenerated || !activePayload) {
      onNotify('Please click "Create QR Code" first before downloading.', 'error');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (format === 'svg') {
      QRCode.toString(
        activePayload,
        {
          type: 'svg',
          errorCorrectionLevel: options.errorCorrectionLevel,
          margin: options.margin,
          color: {
            dark: options.fgColor,
            light: options.bgColor,
          },
        },
        (err, svgString) => {
          if (err || !svgString) {
            onNotify('Error generating SVG QR Code.', 'error');
            return;
          }
          downloadSvgString(svgString, `qr-code-${Date.now()}.svg`);
          onNotify('SVG QR Code downloaded successfully!', 'success');
        }
      );
    } else {
      const ext = format === 'jpeg' ? 'jpg' : 'png';
      downloadCanvas(canvas, `qr-code-${Date.now()}.${ext}`, format);
      onNotify(`${ext.toUpperCase()} QR Code downloaded successfully!`, 'success');
    }
  };

  // Copy Image
  const handleCopyImage = async () => {
    if (!isGenerated) {
      onNotify('Please click "Create QR Code" first.', 'error');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ok = await copyCanvasToClipboard(canvas);
    if (ok) {
      onNotify('QR Code image copied to clipboard!', 'success');
    } else {
      onNotify('Unable to copy image to clipboard in this browser.', 'error');
    }
  };

  // Copy Payload
  const handleCopyPayload = async () => {
    if (!isGenerated || !activePayload) {
      onNotify('Please create a QR Code first.', 'error');
      return;
    }
    const ok = await copyTextToClipboard(activePayload);
    if (ok) {
      onNotify('QR content copied to clipboard!', 'success');
    } else {
      onNotify('Failed to copy text.', 'error');
    }
  };

  // Reset / Clear function (RESTORES CLEAN INITIAL STATE, NO DUMMY DATA)
  const handleReset = () => {
    setSingleUrl('');
    setUrls(['']);
    setSelectedMultiUrlIndex(0);
    setText('');
    setWifi({ ssid: '', password: '', encryption: 'WPA', hidden: false });
    setEmail({ email: '', subject: '', body: '' });
    setSinglePhone('');
    setPhones(['']);
    setSelectedMultiPhoneIndex(0);
    setSms({ phone: '', message: '' });
    setVcard({
      firstName: '',
      lastName: '',
      organization: '',
      jobTitle: '',
      phone: '',
      email: '',
      website: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      notes: '',
    });
    setLocation({ latitude: '', longitude: '', query: '' });
    setEventData({ title: '', startDateTime: '', endDateTime: '', location: '', description: '' });
    setWhatsapp({ phone: '', message: '' });
    setCrypto({ coin: 'bitcoin', address: '', amount: '', label: '' });
    setLogoImage(null);
    setLogoDataUrl(null);
    setIsGenerated(false);
    setActivePayload('');
    setErrorMsg(null);
    setContrastWarning(null);

    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    onNotify('All fields cleared and generator reset.', 'info');
  };

  // Change QR Type without dummy data
  const handleTypeChange = (newType: QrType) => {
    setQrType(newType);
    setIsGenerated(false);
    setActivePayload('');
    setErrorMsg(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <BackButton onBack={onBack} label="Back to Home" />
        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          Step 1: Enter details · Step 2: Click Create QR Code
        </span>
      </div>

      {/* Header section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Free QR Code Generator
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 max-w-3xl">
          Select a content type, enter your information, and click <strong>Create QR Code</strong> to generate your custom design. No login, no watermarks, and 100% free.
        </p>
      </div>

      {/* Main Grid: Inputs on Left, Result / Download on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: QR Type & Form Fields (INPUT AREA) */}
        <div className="lg:col-span-7 space-y-6">
          {/* QR Type Selector Buttons */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
              1. Select QR Content Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {typeTabs.map((tab) => {
                const isSelected = qrType === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTypeChange(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    <span className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-400'}>
                      {tab.icon}
                    </span>
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Content Fields (CLEAN, NO HARDCODED DUMMY VALUES) */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                2. Enter Information
              </span>
              <span className="text-xs text-neutral-400">No account required</span>
            </div>

            {/* 1. URL */}
            {qrType === 'url' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Website URL(s)
                  </h3>
                  {urls.length > 1 && (
                    <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-md text-xs">
                      <button
                        type="button"
                        onClick={() => setMultiMode('individual')}
                        className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                          multiMode === 'individual'
                            ? 'bg-white dark:bg-neutral-700 font-medium text-neutral-900 dark:text-white shadow-xs'
                            : 'text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        Individual Codes
                      </button>
                      <button
                        type="button"
                        onClick={() => setMultiMode('combined')}
                        className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                          multiMode === 'combined'
                            ? 'bg-white dark:bg-neutral-700 font-medium text-neutral-900 dark:text-white shadow-xs'
                            : 'text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        Single List Code
                      </button>
                    </div>
                  )}
                </div>

                {urls.length === 1 ? (
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Website Address (URL)
                    </label>
                    <input
                      type="url"
                      value={urls[0] !== undefined ? urls[0] : singleUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSingleUrl(val);
                        setUrls([val]);
                      }}
                      placeholder="Enter website URL (e.g. https://example.com)"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {urls.map((u, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-mono text-neutral-400 w-5">#{idx + 1}</span>
                        <input
                          type="url"
                          value={u}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = [...urls];
                            updated[idx] = val;
                            setUrls(updated);
                            if (idx === 0) setSingleUrl(val);
                          }}
                          placeholder={`Enter URL #${idx + 1}`}
                          className="flex-1 px-3.5 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        {multiMode === 'individual' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMultiUrlIndex(idx);
                              if (isGenerated) {
                                const selectedU = urls[idx] || '';
                                const payload = !/^https?:\/\//i.test(selectedU.trim()) && selectedU.trim() ? `https://${selectedU.trim()}` : selectedU.trim();
                                if (payload) {
                                  setActivePayload(payload);
                                  drawQrCode(payload, options);
                                }
                              }
                            }}
                            className={`px-2.5 py-2 text-xs rounded-lg border transition-colors cursor-pointer ${
                              selectedMultiUrlIndex === idx
                                ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                                : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                            }`}
                          >
                            Active #{idx + 1}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (urls.length <= 1) return;
                            const updated = urls.filter((_, i) => i !== idx);
                            setUrls(updated);
                            setSingleUrl(updated[0] || '');
                            if (selectedMultiUrlIndex >= updated.length) {
                              setSelectedMultiUrlIndex(Math.max(0, updated.length - 1));
                            }
                          }}
                          className="p-2 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                          title="Remove URL"
                          aria-label={`Remove URL ${idx + 1}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Another URL Button */}
                <button
                  type="button"
                  onClick={() => {
                    const currentFirst = urls[0] !== undefined ? urls[0] : singleUrl;
                    const next = urls.length === 1 ? [currentFirst, ''] : [...urls, ''];
                    setUrls(next);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:border-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another URL</span>
                </button>
              </div>
            )}

            {/* 2. Text */}
            {qrType === 'text' && (
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Plain Text Content
                </label>
                <textarea
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter your message, notes, instructions, or plain text here..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            )}

            {/* 3. Wi-Fi */}
            {qrType === 'wifi' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Network Name (SSID) *
                    </label>
                    <input
                      type="text"
                      value={wifi.ssid}
                      onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                      placeholder="Enter network name (SSID)"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Security Encryption
                    </label>
                    <select
                      value={wifi.encryption}
                      onChange={(e) =>
                        setWifi({ ...wifi, encryption: e.target.value as 'WPA' | 'WEP' | 'nopass' })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3 (Default)</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None (Open Network)</option>
                    </select>
                  </div>
                </div>

                {wifi.encryption !== 'nopass' && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Network Password
                    </label>
                    <input
                      type="text"
                      value={wifi.password}
                      onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                      placeholder="Enter Wi-Fi password"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={wifi.hidden}
                    onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })}
                    className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>This is a hidden network SSID</span>
                </label>
              </div>
            )}

            {/* 4. Email */}
            {qrType === 'email' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Recipient Email Address *
                  </label>
                  <input
                    type="email"
                    value={email.email}
                    onChange={(e) => setEmail({ ...email, email: e.target.value })}
                    placeholder="recipient@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={email.subject}
                    onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                    placeholder="Enter email subject"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Message Body
                  </label>
                  <textarea
                    rows={3}
                    value={email.body}
                    onChange={(e) => setEmail({ ...email, body: e.target.value })}
                    placeholder="Enter message body..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            {/* 5. Phone */}
            {qrType === 'phone' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Phone Number(s)
                  </h3>
                  {phones.length > 1 && (
                    <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-md text-xs">
                      <button
                        type="button"
                        onClick={() => setMultiMode('individual')}
                        className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                          multiMode === 'individual'
                            ? 'bg-white dark:bg-neutral-700 font-medium text-neutral-900 dark:text-white shadow-xs'
                            : 'text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        Individual Codes
                      </button>
                      <button
                        type="button"
                        onClick={() => setMultiMode('combined')}
                        className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                          multiMode === 'combined'
                            ? 'bg-white dark:bg-neutral-700 font-medium text-neutral-900 dark:text-white shadow-xs'
                            : 'text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        Single List Code
                      </button>
                    </div>
                  )}
                </div>

                {phones.length === 1 ? (
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Phone Number (with Country Code)
                    </label>
                    <input
                      type="tel"
                      value={phones[0] !== undefined ? phones[0] : singlePhone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSinglePhone(val);
                        setPhones([val]);
                      }}
                      placeholder="e.g. +1 555 123 4567"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {phones.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-mono text-neutral-400 w-5">#{idx + 1}</span>
                        <input
                          type="tel"
                          value={p}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = [...phones];
                            updated[idx] = val;
                            setPhones(updated);
                            if (idx === 0) setSinglePhone(val);
                          }}
                          placeholder={`Enter phone number #${idx + 1}`}
                          className="flex-1 px-3.5 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        {multiMode === 'individual' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMultiPhoneIndex(idx);
                              if (isGenerated) {
                                const phoneVal = (phones[idx] || '').trim().replace(/[^0-9+]/g, '');
                                if (phoneVal) {
                                  const payload = `tel:${phoneVal}`;
                                  setActivePayload(payload);
                                  drawQrCode(payload, options);
                                }
                              }
                            }}
                            className={`px-2.5 py-2 text-xs rounded-lg border transition-colors cursor-pointer ${
                              selectedMultiPhoneIndex === idx
                                ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                                : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                            }`}
                          >
                            Active #{idx + 1}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (phones.length <= 1) return;
                            const updated = phones.filter((_, i) => i !== idx);
                            setPhones(updated);
                            setSinglePhone(updated[0] || '');
                            if (selectedMultiPhoneIndex >= updated.length) {
                              setSelectedMultiPhoneIndex(Math.max(0, updated.length - 1));
                            }
                          }}
                          className="p-2 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                          title="Remove Phone"
                          aria-label={`Remove Phone ${idx + 1}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Another Phone Button */}
                <button
                  type="button"
                  onClick={() => {
                    const currentFirst = phones[0] !== undefined ? phones[0] : singlePhone;
                    const next = phones.length === 1 ? [currentFirst, ''] : [...phones, ''];
                    setPhones(next);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:border-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Phone</span>
                </button>
              </div>
            )}

            {/* 6. SMS */}
            {qrType === 'sms' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={sms.phone}
                    onChange={(e) => setSms({ ...sms, phone: e.target.value })}
                    placeholder="e.g. +1 555 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Prefilled SMS Message
                  </label>
                  <textarea
                    rows={3}
                    value={sms.message}
                    onChange={(e) => setSms({ ...sms, message: e.target.value })}
                    placeholder="Enter prefilled message..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            {/* 7. Contact / vCard */}
            {qrType === 'vcard' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={vcard.firstName}
                      onChange={(e) => setVcard({ ...vcard, firstName: e.target.value })}
                      placeholder="First Name"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={vcard.lastName}
                      onChange={(e) => setVcard({ ...vcard, lastName: e.target.value })}
                      placeholder="Last Name"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={vcard.organization}
                      onChange={(e) => setVcard({ ...vcard, organization: e.target.value })}
                      placeholder="Company / Organization"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={vcard.jobTitle}
                      onChange={(e) => setVcard({ ...vcard, jobTitle: e.target.value })}
                      placeholder="Job Title"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={vcard.phone}
                      onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                      placeholder="Phone Number"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={vcard.email}
                      onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                      placeholder="Email Address"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={vcard.website}
                    onChange={(e) => setVcard({ ...vcard, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            {/* 8. Location */}
            {qrType === 'location' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      value={location.latitude}
                      onChange={(e) => setLocation({ ...location, latitude: e.target.value })}
                      placeholder="e.g. 37.7749"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      value={location.longitude}
                      onChange={(e) => setLocation({ ...location, longitude: e.target.value })}
                      placeholder="e.g. -122.4194"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Or Search Address / Place Name
                  </label>
                  <input
                    type="text"
                    value={location.query}
                    onChange={(e) => setLocation({ ...location, query: e.target.value })}
                    placeholder="e.g. Times Square, New York"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            {/* 9. Event / Calendar */}
            {qrType === 'event' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={eventData.title}
                    onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                    placeholder="Enter event title"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={eventData.startDateTime}
                      onChange={(e) => setEventData({ ...eventData, startDateTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={eventData.endDateTime}
                      onChange={(e) => setEventData({ ...eventData, endDateTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 10. WhatsApp */}
            {qrType === 'whatsapp' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    WhatsApp Phone Number (with Country Code) *
                  </label>
                  <input
                    type="tel"
                    value={whatsapp.phone}
                    onChange={(e) => setWhatsapp({ ...whatsapp, phone: e.target.value })}
                    placeholder="e.g. 15551234567"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Prefilled Message
                  </label>
                  <textarea
                    rows={3}
                    value={whatsapp.message}
                    onChange={(e) => setWhatsapp({ ...whatsapp, message: e.target.value })}
                    placeholder="Type prefilled message..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            {/* 11. Crypto */}
            {qrType === 'crypto' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Cryptocurrency
                    </label>
                    <select
                      value={crypto.coin}
                      onChange={(e) =>
                        setCrypto({
                          ...crypto,
                          coin: e.target.value as CryptoData['coin'],
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="bitcoin">Bitcoin (BTC)</option>
                      <option value="ethereum">Ethereum (ETH)</option>
                      <option value="solana">Solana (SOL)</option>
                      <option value="usdt">Tether (USDT)</option>
                      <option value="litecoin">Litecoin (LTC)</option>
                      <option value="dogecoin">Dogecoin (DOGE)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Amount (Optional)
                    </label>
                    <input
                      type="text"
                      value={crypto.amount}
                      onChange={(e) => setCrypto({ ...crypto, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Wallet Public Address *
                  </label>
                  <input
                    type="text"
                    value={crypto.address}
                    onChange={(e) => setCrypto({ ...crypto, address: e.target.value })}
                    placeholder="Enter wallet public address"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            {/* Error Message inside Form */}
            {errorMsg && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* MANDATORY PRIMARY ACTION BUTTONS (INPUT AREA) */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleCreateQr}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all hover:scale-[1.01] cursor-pointer touch-manipulation min-h-[46px]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create QR Code</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-2 py-3 px-5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-medium transition-colors cursor-pointer touch-manipulation min-h-[46px]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset / Clear</span>
              </button>
            </div>
          </div>

          {/* Customization Accordion / Controls */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              3. Customize Colors & Style (Optional)
            </h3>

            {/* Presets */}
            <div>
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-2">
                Color Themes
              </span>
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      updateOptionsAndRerender({
                        ...options,
                        fgColor: preset.fg,
                        bgColor: preset.bg,
                      })
                    }
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs hover:border-blue-500 transition-colors cursor-pointer"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                      style={{ background: preset.fg }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                      style={{ background: preset.bg }}
                    />
                    <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Foreground & Background color pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Foreground Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={options.fgColor}
                    onChange={(e) =>
                      updateOptionsAndRerender({ ...options, fgColor: e.target.value })
                    }
                    className="w-9 h-9 p-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={options.fgColor}
                    onChange={(e) =>
                      updateOptionsAndRerender({ ...options, fgColor: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={options.bgColor}
                    onChange={(e) =>
                      updateOptionsAndRerender({ ...options, bgColor: e.target.value })
                    }
                    className="w-9 h-9 p-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={options.bgColor}
                    onChange={(e) =>
                      updateOptionsAndRerender({ ...options, bgColor: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Module Pattern Style & Error Correction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Pattern Module Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['square', 'rounded', 'dots'] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() =>
                        updateOptionsAndRerender({ ...options, dotStyle: style })
                      }
                      className={`px-3 py-2 rounded-lg border text-xs font-medium capitalize transition-colors cursor-pointer ${
                        options.dotStyle === style
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Error Correction Level
                </label>
                <select
                  value={options.errorCorrectionLevel}
                  onChange={(e) =>
                    updateOptionsAndRerender({
                      ...options,
                      errorCorrectionLevel: e.target.value as ErrorCorrectionLevel,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="L">L – Low (7% recoverability)</option>
                  <option value="M">M – Medium (15% - Recommended)</option>
                  <option value="Q">Q – Quartile (25% recoverability)</option>
                  <option value="H">H – High (30% - Best with logo)</option>
                </select>
              </div>
            </div>

            {/* Sliders: Size & Margin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  <span>Image Size</span>
                  <span className="font-mono">{options.size}px</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="1024"
                  step="32"
                  value={options.size}
                  onChange={(e) =>
                    updateOptionsAndRerender({
                      ...options,
                      size: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  <span>Border Margin</span>
                  <span className="font-mono">{options.margin} blocks</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="1"
                  value={options.margin}
                  onChange={(e) =>
                    updateOptionsAndRerender({
                      ...options,
                      margin: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Optional Center Logo */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Optional Center Logo / Icon
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer transition-colors">
                  <ImageIcon className="w-4 h-4" />
                  <span>{logoImage ? 'Replace Logo' : 'Upload Center Logo'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                {logoDataUrl && (
                  <div className="flex items-center gap-2">
                    <img
                      src={logoDataUrl}
                      alt="Logo preview"
                      className="w-8 h-8 rounded border border-neutral-300 dark:border-neutral-700 object-contain p-0.5 bg-white"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="text-xs text-rose-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Warnings if contrast or reliability issue */}
            {contrastWarning && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>{contrastWarning}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live QR Preview Card & Actions (RESULT AREA) */}
        <div className="lg:col-span-5 sticky top-20 space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col items-center shadow-xs">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Generated QR Code Preview
              </span>
              {isGenerated && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Reset and clear all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* QR Canvas Display Container: ALWAYS MOUNTED IN DOM SO canvasRef.current IS NEVER NULL */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-950/60 flex items-center justify-center min-h-[300px] w-full max-w-[340px] aspect-square overflow-hidden relative">
              <canvas
                ref={canvasRef}
                className={`max-w-full max-h-full object-contain rounded-lg shadow-sm ${
                  isGenerated ? 'block' : 'hidden'
                }`}
              />

              {!isGenerated && (
                <div className="flex flex-col items-center justify-center p-6 text-center text-neutral-400 dark:text-neutral-500">
                  <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center mb-3">
                    <QrCode className="w-8 h-8 text-neutral-400 dark:text-neutral-600" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Your QR Code will appear here
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-[220px]">
                    Enter your details on the left and click <strong>Create QR Code</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Multi-URL selector indicator if active */}
            {isGenerated && qrType === 'url' && urls.length > 1 && multiMode === 'individual' && (
              <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium text-center">
                Showing QR for URL #{selectedMultiUrlIndex + 1} of {urls.length}
              </div>
            )}

            {/* RESULT AREA: DOWNLOAD & COPY OPTIONS (Only appears after generation, NO duplicate Create button!) */}
            {isGenerated ? (
              <div className="w-full space-y-4 mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 block">
                    Download QR Code
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload('png')}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer min-h-[42px]"
                      title="Download as PNG image"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PNG</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload('svg')}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold shadow-xs transition-colors cursor-pointer min-h-[42px]"
                      title="Download as vector SVG"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download SVG</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload('jpeg')}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-colors cursor-pointer min-h-[42px]"
                      title="Download as JPG"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download JPG</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyImage}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors cursor-pointer min-h-[40px]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPayload}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors cursor-pointer min-h-[40px]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Content</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Create Another / Reset</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full text-center py-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
                Download formats (PNG, SVG, JPG) will appear here after creating your QR code.
              </div>
            )}

            {/* Checklist */}
            <div className="w-full mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-500" />
                <span>100% Client-side generated — No data sent to any server</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-500" />
                <span>Vector SVG export for crisp printing & packaging</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-500" />
                <span>Compatible with iOS Camera, Android Lens & handheld scanners</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
