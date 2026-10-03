import React, { useState, useRef, useEffect } from 'react';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import { copyTextToClipboard } from '../../utils/downloadUtils';
import { BackButton } from '../common/BackButton';
import {
  Upload,
  Camera,
  Copy,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  Shield,
  VideoOff,
  Sparkles,
  QrCode,
} from 'lucide-react';

interface QrScannerProps {
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onBack?: () => void;
}

export const QrScanner: React.FC<QrScannerProps> = ({ onNotify, onBack }) => {
  const [scanMode, setScanMode] = useState<'upload' | 'camera'>('upload');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected file & preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Decoded Result
  const [decodedText, setDecodedText] = useState<string | null>(null);

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const imageElementRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    codeReaderRef.current = new BrowserQRCodeReader();
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch {
        // ignore
      }
      controlsRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Start Camera
  const startCamera = async (deviceId?: string) => {
    setErrorMsg(null);
    setCameraPermissionDenied(false);
    setLoading(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser. Please use the image upload option.');
      }

      stopCamera();

      try {
        const devices = await BrowserQRCodeReader.listVideoInputDevices();
        setVideoDevices(devices);
        if (!selectedDeviceId && devices.length > 0) {
          setSelectedDeviceId(devices[0].deviceId);
        }
      } catch {
        // ignore
      }

      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserQRCodeReader();
      }

      const activeDevId = deviceId || selectedDeviceId || undefined;
      const videoElem = videoRef.current;
      if (!videoElem) {
        setLoading(false);
        return;
      }

      const controls = await codeReaderRef.current.decodeFromVideoDevice(
        activeDevId,
        videoElem,
        (result) => {
          if (result) {
            const text = result.getText();
            setDecodedText(text);
            onNotify('QR Code scanned successfully!', 'success');
            stopCamera();
          }
        }
      );

      controlsRef.current = controls;
      setIsCameraActive(true);
      setLoading(false);
    } catch (err: unknown) {
      const errObj = err as Error;
      setLoading(false);
      setIsCameraActive(false);
      if (errObj.name === 'NotAllowedError' || errObj.name === 'PermissionDeniedError') {
        setCameraPermissionDenied(true);
        setErrorMsg('Camera permission was denied. You can grant access in your browser settings or upload an image file instead.');
      } else {
        setErrorMsg(errObj.message || 'Unable to open camera. Please use the file upload option.');
      }
    }
  };

  // Handle Image File Selection (Does not auto-scan; waits for user to click "Scan QR Code")
  const handleFileSelect = (file: File) => {
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpe?g|svg\+xml|webp)$/i) && !file.name.match(/\.(png|jpe?g|svg|webp)$/i)) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, JPEG, SVG, or WEBP).');
      return;
    }

    setErrorMsg(null);
    setDecodedText(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // EXPLICIT ACTION: User clicks "Scan QR Code" button
  const handleScanUploadedImage = async () => {
    if (!previewImage) {
      setErrorMsg('Please import or choose an image first.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    setDecodedText(null);

    try {
      const img = new Image();
      img.onload = async () => {
        try {
          if (!codeReaderRef.current) {
            codeReaderRef.current = new BrowserQRCodeReader();
          }
          const result = await codeReaderRef.current.decodeFromImageElement(img);
          if (result && result.getText()) {
            setDecodedText(result.getText());
            onNotify('QR Code detected and decoded!', 'success');
          } else {
            setErrorMsg('No readable QR code was detected in this image. Please ensure the QR code is clear, well-lit, and not cropped.');
          }
        } catch {
          setErrorMsg('No readable QR code was detected in this image. Please ensure the QR code is clear, unblurred, and has sufficient contrast.');
        } finally {
          setLoading(false);
        }
      };
      img.onerror = () => {
        setErrorMsg('Failed to load image file.');
        setLoading(false);
      };
      img.src = previewImage;
    } catch {
      setErrorMsg('Error processing image.');
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  // Reset / Clear everything
  const handleClear = () => {
    stopCamera();
    setSelectedFile(null);
    setPreviewImage(null);
    setDecodedText(null);
    setErrorMsg(null);
    setCameraPermissionDenied(false);
    onNotify('Scanner cleared.', 'info');
  };

  const handleTabChange = (mode: 'upload' | 'camera') => {
    if (mode === scanMode) return;
    if (scanMode === 'camera') {
      stopCamera();
    }
    setScanMode(mode);
    setErrorMsg(null);
  };

  // Parse result semantics
  const parseResultSemantics = (text: string) => {
    const isUrl = /^https?:\/\//i.test(text) || /^www\./i.test(text);
    const isEmail = /^mailto:/i.test(text);
    const isPhone = /^tel:/i.test(text);

    return {
      isUrl,
      isEmail,
      isPhone,
      rawUrl: isUrl ? (text.startsWith('http') ? text : `https://${text}`) : null,
    };
  };

  const semantics = decodedText ? parseResultSemantics(decodedText) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <BackButton onBack={onBack} label="Back to Home" />
        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          Upload Image or Camera
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Free QR Code Scanner
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Upload a QR code image or scan directly using your camera. All processing happens 100% locally inside your browser without uploading to any server.
        </p>
      </div>

      {/* Main Scanner Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        {/* Mode Selector Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => handleTabChange('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
              scanMode === 'upload'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/20'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('camera')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
              scanMode === 'camera'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/20'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Use Camera</span>
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1: Upload Image */}
          {scanMode === 'upload' && (
            <div className="space-y-5">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors bg-neutral-50/50 dark:bg-neutral-950/50"
              >
                {previewImage ? (
                  <div className="space-y-4 flex flex-col items-center w-full">
                    <img
                      ref={imageElementRef}
                      src={previewImage}
                      alt="Selected QR Preview"
                      className="max-h-60 max-w-full rounded-lg object-contain shadow-xs border border-neutral-200 dark:border-neutral-800"
                    />

                    {/* Change image option */}
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
                      <span>Choose Different Image</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Drag & drop your QR code image here
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Supports PNG, JPG, JPEG, SVG, and WEBP formats
                    </p>

                    <label className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold shadow-xs cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Import / Choose Image</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>

              {/* MANDATORY ACTION BUTTON: [ Scan QR Code ] after image selected */}
              {previewImage && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={handleScanUploadedImage}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold shadow-sm transition-all hover:scale-[1.01] cursor-pointer touch-manipulation min-h-[46px]"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{loading ? 'Decoding QR Code...' : 'Scan QR Code'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex items-center justify-center gap-2 py-3 px-5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-medium transition-colors cursor-pointer touch-manipulation min-h-[46px]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Clear</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Camera Scanner */}
          {scanMode === 'camera' && (
            <div className="space-y-4">
              {!isCameraActive ? (
                <div className="p-8 text-center flex flex-col items-center justify-center rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Scan via Live Camera
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mt-1 mb-4">
                    Camera permissions are requested only after clicking below. Your camera frames are processed directly inside your browser.
                  </p>

                  <button
                    type="button"
                    onClick={() => startCamera()}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer min-h-[44px]"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{loading ? 'Requesting Access...' : 'Open Camera'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Camera Controls Bar */}
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                        Camera Active
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {videoDevices.length > 1 && (
                        <select
                          value={selectedDeviceId}
                          onChange={(e) => {
                            setSelectedDeviceId(e.target.value);
                            startCamera(e.target.value);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs"
                        >
                          {videoDevices.map((dev, idx) => (
                            <option key={dev.deviceId} value={dev.deviceId}>
                              {dev.label || `Camera ${idx + 1}`}
                            </option>
                          ))}
                        </select>
                      )}

                      <button
                        type="button"
                        onClick={stopCamera}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                      >
                        <VideoOff className="w-3.5 h-3.5" />
                        <span>Stop Camera</span>
                      </button>
                    </div>
                  </div>

                  {/* Video Viewport with Targeting Overlay */}
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-[360px] flex items-center justify-center">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                      autoPlay
                    />

                    {/* Scan reticle overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-blue-500/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
                        <div className="absolute inset-x-2 top-0 h-0.5 bg-blue-400 shadow-[0_0_8px_#3b82f6] animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-xs text-neutral-500">
                    Align the QR code within the frame to decode automatically.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Message Display */}
          {errorMsg && (
            <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Decoded Result Card */}
          {decodedText && (
            <div className="mt-6 p-5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Decoded QR Code Result
                  </h3>
                </div>
              </div>

              {/* Formatted Output Box */}
              <div className="p-3.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-900 dark:text-neutral-100 break-all whitespace-pre-wrap max-h-48 overflow-y-auto select-all">
                {decodedText}
              </div>

              {/* MANDATORY ACTIONS: [ Copy Result ] [ Open Link ] [ Scan Another ] [ Clear ] */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await copyTextToClipboard(decodedText);
                    if (ok) onNotify('Decoded text copied to clipboard!', 'success');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer min-h-[40px]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Result</span>
                </button>

                {semantics?.isUrl && semantics.rawUrl && (
                  <a
                    href={semantics.rawUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold shadow-xs transition-colors cursor-pointer min-h-[40px]"
                  >
                    <span>Open Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {semantics?.isEmail && (
                  <a
                    href={decodedText}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors cursor-pointer min-h-[40px]"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Email</span>
                  </a>
                )}

                {semantics?.isPhone && (
                  <a
                    href={decodedText}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors cursor-pointer min-h-[40px]"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Phone</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors cursor-pointer min-h-[40px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Scan Another</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors cursor-pointer min-h-[40px]"
                >
                  <span>Clear</span>
                </button>
              </div>

              {/* Safety notice for URLs */}
              {semantics?.isUrl && (
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 pt-1">
                  <Shield className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Always verify website addresses before proceeding to unknown external sites.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
