import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { copyTextToClipboard } from '../../utils/downloadUtils';
import { BackButton } from '../common/BackButton';
import {
  Upload,
  Camera,
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Barcode,
  VideoOff,
  Tag,
  Sparkles,
} from 'lucide-react';

interface BarcodeScannerProps {
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onBack?: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onNotify, onBack }) => {
  const [scanMode, setScanMode] = useState<'upload' | 'camera'>('upload');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected file & preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Decoded Results
  const [decodedValue, setDecodedValue] = useState<string | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<string | null>(null);

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const multiReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  // Format mapping helper
  const formatNameMap: Record<string, string> = {
    '0': 'AZTEC',
    '1': 'CODABAR',
    '2': 'CODE 39',
    '3': 'CODE 93',
    '4': 'CODE 128',
    '5': 'DATA MATRIX',
    '6': 'EAN-8',
    '7': 'EAN-13',
    '8': 'ITF (Interleaved 2 of 5)',
    '9': 'MAXICODE',
    '10': 'PDF417',
    '11': 'QR CODE',
    '14': 'UPC-A',
    '15': 'UPC-E',
    AZTEC: 'AZTEC',
    CODABAR: 'CODABAR',
    CODE_39: 'CODE 39',
    CODE_93: 'CODE 93',
    CODE_128: 'CODE 128',
    DATA_MATRIX: 'DATA MATRIX',
    EAN_8: 'EAN-8',
    EAN_13: 'EAN-13',
    ITF: 'ITF (Interleaved 2 of 5)',
    PDF_417: 'PDF417',
    QR_CODE: 'QR CODE',
    UPC_A: 'UPC-A',
    UPC_E: 'UPC-E',
  };

  const getFormatLabel = (fmt: any): string => {
    const key = String(fmt);
    return formatNameMap[key] || `FORMAT ${key}`;
  };

  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_93,
      BarcodeFormat.ITF,
      BarcodeFormat.CODABAR,
      BarcodeFormat.PDF_417,
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.AZTEC,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    multiReaderRef.current = new BrowserMultiFormatReader(hints);

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

  const startCamera = async (deviceId?: string) => {
    setErrorMsg(null);
    setCameraPermissionDenied(false);
    setLoading(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by this browser. Please use the image upload option.');
      }

      stopCamera();

      if (!multiReaderRef.current) {
        multiReaderRef.current = new BrowserMultiFormatReader();
      }

      const activeDevId = deviceId || selectedDeviceId || undefined;
      const videoElem = videoRef.current;
      if (!videoElem) {
        setLoading(false);
        return;
      }

      // Constraints favoring rear/environment camera on smartphones
      const constraints: MediaStreamConstraints = {
        video: activeDevId
          ? { deviceId: { exact: activeDevId } }
          : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };

      const controls = await multiReaderRef.current.decodeFromConstraints(
        constraints,
        videoElem,
        (result) => {
          if (result) {
            setDecodedValue(result.getText());
            setDetectedFormat(getFormatLabel(result.getBarcodeFormat()));
            onNotify('Barcode decoded successfully!', 'success');
            stopCamera();
          }
        }
      );

      controlsRef.current = controls;
      setIsCameraActive(true);
      setLoading(false);

      // Enumerate camera devices after permission is granted
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        setVideoDevices(devices);
        if (!selectedDeviceId && devices.length > 0) {
          const preferred = devices.find(d => /back|rear|environment/i.test(d.label)) || devices[0];
          setSelectedDeviceId(preferred.deviceId);
        }
      } catch {
        // ignore enumeration issues
      }
    } catch (err: unknown) {
      const errObj = err as Error;
      setLoading(false);
      setIsCameraActive(false);
      if (errObj.name === 'NotAllowedError' || errObj.name === 'PermissionDeniedError') {
        setCameraPermissionDenied(true);
        setErrorMsg('Camera permission was denied. You can upload an image file instead or allow camera permissions in your browser settings.');
      } else if (errObj.name === 'NotFoundError' || errObj.name === 'DevicesNotFoundError') {
        setErrorMsg('No camera device was found on this device. Please use the image upload option.');
      } else if (errObj.name === 'NotReadableError' || errObj.name === 'TrackStartError') {
        setErrorMsg('Camera is currently in use by another application. Please close other camera apps and try again.');
      } else {
        setErrorMsg(errObj.message || 'Unable to open camera. Please use the image upload option.');
      }
    }
  };

  // Handle File Selection (Wait for user to click "Scan Barcode")
  const handleFileSelect = (file: File) => {
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpe?g|svg\+xml|webp)$/i) && !file.name.match(/\.(png|jpe?g|svg|webp)$/i)) {
      setErrorMsg('Please upload a valid image file (JPG, PNG, JPEG, SVG, or WEBP).');
      return;
    }

    setErrorMsg(null);
    setDecodedValue(null);
    setDetectedFormat(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // EXPLICIT ACTION: User clicks "Scan Barcode" button
  const handleScanUploadedImage = async () => {
    if (!previewImage) {
      setErrorMsg('Please import or choose an image first.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    setDecodedValue(null);
    setDetectedFormat(null);

    try {
      const img = new Image();
      img.onload = async () => {
        try {
          if (!multiReaderRef.current) {
            multiReaderRef.current = new BrowserMultiFormatReader();
          }
          const result = await multiReaderRef.current.decodeFromImageElement(img);
          if (result && result.getText()) {
            setDecodedValue(result.getText());
            setDetectedFormat(getFormatLabel(result.getBarcodeFormat()));
            onNotify('Barcode detected and decoded!', 'success');
          } else {
            setErrorMsg('No readable barcode was detected in this image. Please ensure the bars are clearly visible, unblurred, and high contrast.');
          }
        } catch {
          setErrorMsg('No barcode could be detected in this image. Please ensure the barcode bars are unblurred, well-lit, and completely visible.');
        } finally {
          setLoading(false);
        }
      };
      img.onerror = () => {
        setErrorMsg('Failed to process image file.');
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

  // Reset / Clear
  const handleClear = () => {
    stopCamera();
    setSelectedFile(null);
    setPreviewImage(null);
    setDecodedValue(null);
    setDetectedFormat(null);
    setErrorMsg(null);
    setCameraPermissionDenied(false);
    onNotify('Barcode scanner cleared.', 'info');
  };

  const handleTabChange = (mode: 'upload' | 'camera') => {
    if (mode === scanMode) return;
    if (scanMode === 'camera') {
      stopCamera();
    }
    setScanMode(mode);
    setErrorMsg(null);
  };

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
          Free Barcode Scanner
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Scan standard 1D linear barcodes (EAN-13, UPC-A, Code 128, Code 39, ITF) and 2D matrix codes (Data Matrix, PDF417, Aztec) from images or live camera.
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        {/* Mode Tabs */}
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
                      src={previewImage}
                      alt="Selected Barcode Preview"
                      className="max-h-60 max-w-full rounded-lg object-contain shadow-xs border border-neutral-200 dark:border-neutral-800"
                    />

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
                      <Barcode className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Drag & drop your barcode photo or image here
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Supports EAN-13, UPC-A, Code 128, Code 39, ITF, Data Matrix, PDF417 & Aztec
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

              {/* MANDATORY ACTION BUTTON: [ Scan Barcode ] after image selected */}
              {previewImage && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={handleScanUploadedImage}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold shadow-sm transition-all hover:scale-[1.01] cursor-pointer touch-manipulation min-h-[46px]"
                  >
                    <Barcode className="w-4 h-4" />
                    <span>{loading ? 'Decoding Barcode...' : 'Scan Barcode'}</span>
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
              {/* Controls Bar (visible when camera is active) */}
              {isCameraActive && (
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
              )}

              {/* Video Box with Linear Barcode Laser Guide */}
              <div className="relative rounded-xl overflow-hidden bg-neutral-950 aspect-video max-h-[360px] flex items-center justify-center border border-neutral-200 dark:border-neutral-800">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  autoPlay
                />

                {/* Inactive Prompt Overlay with "Open Camera" button */}
                {!isCameraActive && (
                  <div className="absolute inset-0 z-10 p-6 text-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950">
                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                      <Camera className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Scan Barcodes with Live Camera
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mt-1 mb-4">
                      Position the red guide line across the barcode lines. Processing runs 100% locally in your browser.
                    </p>

                    <button
                      type="button"
                      onClick={() => startCamera()}
                      disabled={loading}
                      className="flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer min-h-[44px]"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{loading ? 'Opening Camera...' : 'Open Camera'}</span>
                    </button>
                  </div>
                )}

                {/* Linear Barcode Target Guide (Active state) */}
                {isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-[80%] max-w-md h-32 border-2 border-red-500/70 rounded-lg relative flex items-center shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                      <div className="w-full h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
                    </div>
                  </div>
                )}
              </div>

              {isCameraActive && (
                <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                  Align the red line perpendicular across the barcode bars to decode.
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Decoded Result */}
          {decodedValue && (
            <div className="mt-6 p-5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Decoded Barcode Result
                  </h3>
                </div>
              </div>

              {/* Detected format banner */}
              {detectedFormat && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-neutral-500 dark:text-neutral-400">Detected Format:</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 font-mono">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{detectedFormat}</span>
                  </span>
                </div>
              )}

              {/* Decoded Value Box */}
              <div className="p-3.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100 break-all select-all">
                {decodedValue}
              </div>

              {/* MANDATORY ACTIONS: [ Copy Result ] [ Scan Another ] [ Clear ] */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await copyTextToClipboard(decodedValue);
                    if (ok) onNotify('Barcode value copied to clipboard!', 'success');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer min-h-[40px]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Result</span>
                </button>

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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
