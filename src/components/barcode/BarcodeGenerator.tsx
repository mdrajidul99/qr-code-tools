import React, { useState, useRef } from 'react';
import bwipjs from 'bwip-js';
import { BarcodeFormatId, BarcodeOptions } from '../../types/barcode';
import { BARCODE_FORMATS } from '../../utils/barcodeValidators';
import {
  downloadCanvas,
  downloadSvgString,
  copyCanvasToClipboard,
  copyTextToClipboard,
} from '../../utils/downloadUtils';
import { BackButton } from '../common/BackButton';
import {
  Barcode,
  Download,
  Copy,
  RotateCcw,
  Info,
  AlertCircle,
  Sparkles,
  Check,
} from 'lucide-react';

interface BarcodeGeneratorProps {
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onBack?: () => void;
}

export const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({ onNotify, onBack }) => {
  const [format, setFormat] = useState<BarcodeFormatId>('code128');

  // CLEAN / EMPTY INITIAL STATE (No dummy or prefilled data)
  const [value, setValue] = useState('');

  const [options, setOptions] = useState<BarcodeOptions>({
    format: 'code128',
    value: '',
    scale: 3,
    height: 15,
    includeText: true,
    barColor: '#000000',
    bgColor: '#ffffff',
    padding: 10,
    fontSize: 10,
  });

  // Generation state: initially false, barcode is not automatically rendered
  const [isGenerated, setIsGenerated] = useState(false);
  const [activeValue, setActiveValue] = useState('');

  // Always-mounted canvas reference
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const currentMeta = BARCODE_FORMATS[format];

  // Helper to ensure barcode data is appropriately cased for formats requiring uppercase
  const prepareTextForEncode = (fmt: BarcodeFormatId, raw: string): string => {
    const trimmed = raw.trim();
    if (fmt === 'code39' || fmt === 'code93' || fmt === 'codabar') {
      return trimmed.toUpperCase();
    }
    return trimmed;
  };

  // When format changes, do NOT insert dummy data! Keep user input or keep empty.
  const handleFormatChange = (newFormat: BarcodeFormatId) => {
    setFormat(newFormat);
    setIsGenerated(false);
    setActiveValue('');
    setRenderError(null);

    // Validate current value against new format if not empty
    if (value.trim()) {
      const meta = BARCODE_FORMATS[newFormat];
      const validation = meta.validate(value.trim());
      setValidationError(validation.valid ? null : validation.error || `Please enter valid data for ${meta.name}.`);
    } else {
      setValidationError(null);
    }
  };

  // Render Barcode via bwip-js onto canvas
  const drawBarcode = (val: string, currentOptions: BarcodeOptions, currentFormat: BarcodeFormatId): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setRenderError('Canvas rendering target is unavailable.');
      return false;
    }

    const meta = BARCODE_FORMATS[currentFormat];
    const validation = meta.validate(val);
    if (!validation.valid) {
      const errorMsg = validation.error || `Please enter valid data for ${meta.name}.`;
      setValidationError(errorMsg);
      setRenderError(errorMsg);
      return false;
    }

    try {
      const cleanBarColor = currentOptions.barColor.replace('#', '');
      const cleanBgColor = currentOptions.bgColor.replace('#', '');
      const is2D = currentFormat === 'pdf417' || currentFormat === 'datamatrix' || currentFormat === 'aztec';
      const textToEncode = prepareTextForEncode(currentFormat, val);

      const renderOpts: any = {
        bcid: meta.bcid,
        text: textToEncode,
        scale: currentOptions.scale,
        includetext: is2D ? false : currentOptions.includeText,
        textxalign: 'center',
        barcolor: cleanBarColor,
        backgroundcolor: cleanBgColor,
        paddingwidth: currentOptions.padding,
        paddingheight: currentOptions.padding,
        textsize: currentOptions.fontSize,
      };
      if (!is2D) {
        renderOpts.height = currentOptions.height;
      }

      bwipjs.toCanvas(canvas, renderOpts);

      setRenderError(null);
      setValidationError(null);
      return true;
    } catch (err: unknown) {
      const errObj = err as Error;
      const msg = errObj?.message || 'Barcode generation failed. Please check the entered data.';
      setRenderError(msg);
      return false;
    }
  };

  // USER ACTION: "Create Barcode" button click (NO ENTER REQUIRED, Works on desktop and touch)
  const handleCreateBarcode = () => {
    const cleanVal = value.trim();
    if (!cleanVal) {
      const msg = 'Please enter a barcode value first.';
      setValidationError(msg);
      onNotify(msg, 'error');
      return;
    }

    const meta = BARCODE_FORMATS[format];
    const validation = meta.validate(cleanVal);
    if (!validation.valid) {
      const msg = validation.error || `Please enter valid data for ${meta.name}.`;
      setValidationError(msg);
      setRenderError(msg);
      onNotify(msg, 'error');
      return;
    }

    const success = drawBarcode(cleanVal, options, format);
    if (success) {
      setActiveValue(cleanVal);
      setIsGenerated(true);
      setValidationError(null);
      setRenderError(null);
      onNotify('Barcode generated successfully!', 'success');
      if (window.innerWidth < 1024 && canvasRef.current) {
        canvasRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      onNotify('Barcode generation failed. Please check the entered data.', 'error');
    }
  };

  // When customization options change after barcode is generated, re-render smoothly
  const updateOptionsAndRerender = (newOptions: BarcodeOptions) => {
    setOptions(newOptions);
    if (isGenerated && activeValue) {
      drawBarcode(activeValue, newOptions, format);
    }
  };

  // Download actions: PNG, SVG, JPG
  const handleDownload = (formatType: 'png' | 'svg' | 'jpeg') => {
    if (!isGenerated || !activeValue) {
      onNotify('Please generate a barcode first.', 'error');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const baseName = `barcode-${format.toLowerCase()}`;

    if (formatType === 'svg') {
      try {
        const is2D = format === 'pdf417' || format === 'datamatrix' || format === 'aztec';
        const textToEncode = prepareTextForEncode(format, activeValue);
        const svgOpts: any = {
          bcid: currentMeta.bcid,
          text: textToEncode,
          scale: options.scale,
          includetext: is2D ? false : options.includeText,
          textxalign: 'center',
          barcolor: options.barColor.replace('#', ''),
          backgroundcolor: options.bgColor.replace('#', ''),
          paddingwidth: options.padding,
          paddingheight: options.padding,
          textsize: options.fontSize,
        };
        if (!is2D) {
          svgOpts.height = options.height;
        }

        const svgString = bwipjs.toSVG(svgOpts);
        downloadSvgString(svgString, `${baseName}.svg`);
        onNotify('SVG Barcode downloaded successfully!', 'success');
      } catch (err: unknown) {
        const errObj = err as Error;
        onNotify(`SVG export failed: ${errObj?.message || 'Check values'}`, 'error');
      }
    } else if (formatType === 'jpeg') {
      downloadCanvas(canvas, `${baseName}.jpg`, 'jpeg');
      onNotify('JPG Barcode downloaded successfully!', 'success');
    } else {
      downloadCanvas(canvas, `${baseName}.png`, 'png');
      onNotify('PNG Barcode downloaded successfully!', 'success');
    }
  };

  const handleCopyValue = async () => {
    if (!isGenerated || !activeValue) {
      onNotify('Please create a barcode first.', 'error');
      return;
    }
    const ok = await copyTextToClipboard(activeValue);
    if (ok) {
      onNotify('Barcode value copied to clipboard!', 'success');
    } else {
      onNotify('Failed to copy.', 'error');
    }
  };

  const handleCopyImage = async () => {
    if (!isGenerated) {
      onNotify('Please create a barcode first.', 'error');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ok = await copyCanvasToClipboard(canvas);
    if (ok) {
      onNotify('Barcode image copied to clipboard!', 'success');
    } else {
      onNotify('Unable to copy image to clipboard in this browser.', 'error');
    }
  };

  // Reset / Clear function (RESTORES CLEAN INITIAL STATE)
  const handleReset = () => {
    setValue('');
    setActiveValue('');
    setIsGenerated(false);
    setValidationError(null);
    setRenderError(null);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    onNotify('Barcode fields cleared.', 'info');
  };

  const categories: ('1D Retail' | '1D Standard' | '2D Matrix')[] = [
    '1D Retail',
    '1D Standard',
    '2D Matrix',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <BackButton onBack={onBack} label="Back to Home" />
        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          Step 1: Choose format · Step 2: Enter data & click Create Barcode
        </span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Free Online Barcode Generator
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 max-w-3xl">
          Create, customize, and download 12 genuine retail, industrial, and 2D matrix barcode standards. Enter your value and click <strong>Create Barcode</strong>. No account required.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Format selection & Configuration */}
        <div className="lg:col-span-7 space-y-6">
          {/* Format Selector grouped by category */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                1. Select Barcode Format (12 Genuine Standards)
              </label>
            </div>

            <div className="space-y-4">
              {categories.map((cat) => (
                <div key={cat} className="space-y-2">
                  <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    {cat}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {Object.values(BARCODE_FORMATS)
                      .filter((f) => f.category === cat)
                      .map((fmt) => {
                        const isSelected = format === fmt.id;
                        return (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => handleFormatChange(fmt.id)}
                            className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                                : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                            }`}
                          >
                            <span className="text-xs font-semibold">{fmt.name}</span>
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate w-full mt-0.5">
                              {fmt.industry.split(',')[0]}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Value Input Card - CLEAN & EMPTY */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  2. Enter Barcode Value for {currentMeta.name}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Requirements: {currentMeta.requirements}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setValue(currentMeta.example);
                  setValidationError(null);
                  onNotify(`Sample value loaded for ${currentMeta.name}. Click "Create Barcode" to generate.`, 'info');
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                title="Fill with sample value"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Fill Sample</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Value to Encode *
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateBarcode();
                  }
                }}
                placeholder={`Enter ${currentMeta.name} value (e.g. ${currentMeta.example})`}
                className={`w-full px-3.5 py-2.5 rounded-lg border bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 ${
                  validationError
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-neutral-300 dark:border-neutral-700 focus:ring-blue-600'
                }`}
              />
            </div>

            {/* Validation Feedback */}
            {validationError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{validationError}</span>
              </div>
            )}

            {/* MANDATORY PRIMARY ACTION BUTTON (NO ENTER REQUIRED, TOUCH-READY) */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleCreateBarcode}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all hover:scale-[1.01] cursor-pointer touch-manipulation min-h-[46px]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Barcode</span>
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

            {/* Format Description & Industry Use */}
            <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-neutral-800 dark:text-neutral-200">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                <span>About {currentMeta.name}</span>
              </div>
              <p>{currentMeta.description}</p>
              <div className="pt-1 text-[11px] text-neutral-500">
                <strong className="text-neutral-700 dark:text-neutral-300">Typical Usage:</strong>{' '}
                {currentMeta.industry}
              </div>
            </div>
          </div>

          {/* Barcode Customization (Optional) */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              3. Customize Dimensions & Colors (Optional)
            </h3>

            {/* Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Bar Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={options.barColor}
                    onChange={(e) =>
                      updateOptionsAndRerender({ ...options, barColor: e.target.value })
                    }
                    className="w-9 h-9 p-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={options.barColor}
                    onChange={(e) =>
                      updateOptionsAndRerender({ ...options, barColor: e.target.value })
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

            {/* Dimension Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  <span>Width / Scale Multiplier</span>
                  <span className="font-mono">{options.scale}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={options.scale}
                  onChange={(e) =>
                    updateOptionsAndRerender({
                      ...options,
                      scale: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {format !== 'pdf417' && format !== 'datamatrix' && format !== 'aztec' && (
                <div>
                  <div className="flex justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    <span>Bar Height</span>
                    <span className="font-mono">{options.height}mm</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="40"
                    step="1"
                    value={options.height}
                    onChange={(e) =>
                      updateOptionsAndRerender({
                        ...options,
                        height: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Text options for 1D barcodes */}
            {format !== 'pdf417' && format !== 'datamatrix' && format !== 'aztec' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700 dark:text-neutral-300 mt-2">
                  <input
                    type="checkbox"
                    checked={options.includeText}
                    onChange={(e) =>
                      updateOptionsAndRerender({
                        ...options,
                        includeText: e.target.checked,
                      })
                    }
                    className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Display human-readable text</span>
                </label>

                {options.includeText && (
                  <div>
                    <div className="flex justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      <span>Text Font Size</span>
                      <span className="font-mono">{options.fontSize}pt</span>
                    </div>
                    <input
                      type="range"
                      min="7"
                      max="16"
                      step="1"
                      value={options.fontSize}
                      onChange={(e) =>
                        updateOptionsAndRerender({
                          ...options,
                          fontSize: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Barcode Preview & Downloads */}
        <div className="lg:col-span-5 sticky top-20 space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col items-center shadow-xs">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Barcode Preview
              </span>
              {isGenerated && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Clear barcode"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Canvas Preview Container: ALWAYS MOUNTED IN DOM SO canvasRef.current IS NEVER NULL */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-950/60 flex items-center justify-center min-h-[220px] w-full overflow-x-auto relative">
              <canvas
                ref={canvasRef}
                className={`max-w-full rounded shadow-xs ${
                  isGenerated ? 'block' : 'hidden'
                }`}
              />

              {!isGenerated && (
                <div className="flex flex-col items-center justify-center p-6 text-center text-neutral-400 dark:text-neutral-500">
                  <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center mb-3">
                    <Barcode className="w-8 h-8 text-neutral-400 dark:text-neutral-600" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Your Barcode will appear here
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-[220px]">
                    Enter valid barcode data on the left and click <strong>Create Barcode</strong>.
                  </p>
                </div>
              )}
            </div>

            {renderError && (
              <p className="mt-3 text-xs text-rose-500 text-center font-medium">{renderError}</p>
            )}

            {/* Value confirmation banner */}
            {isGenerated && activeValue && (
              <div className="w-full mt-4 p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Encoded:</span>
                <span className="font-mono font-medium text-neutral-900 dark:text-white truncate max-w-[200px]">
                  {activeValue}
                </span>
                <button
                  type="button"
                  onClick={handleCopyValue}
                  className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                  title="Copy Value"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* RESULT AREA: DOWNLOAD & COPY CONTROLS (Only visible after generation) */}
            {isGenerated ? (
              <div className="w-full space-y-4 mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 block">
                    Download Barcode
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
                      title="Download as JPG image"
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
                    onClick={handleCopyValue}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors cursor-pointer min-h-[40px]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Value</span>
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
                Download formats (PNG, SVG, JPG) will appear here after creating your barcode.
              </div>
            )}

            {/* Quality Note */}
            <div className="w-full mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-500" />
                <span>Genuine {currentMeta.name} standard compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-500" />
                <span>Precision vector rendering for laser & thermal printers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-500" />
                <span>Scannable with physical laser guns and camera mobile apps</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
