import { BarcodeFormatId, BarcodeFormatMeta } from '../types/barcode';

// Check digit calculation for EAN-13
export function calculateEan13CheckDigit(digits12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const d = parseInt(digits12[i], 10);
    sum += i % 2 === 0 ? d : d * 3;
  }
  const mod = sum % 10;
  return mod === 0 ? 0 : 10 - mod;
}

// Check digit calculation for EAN-8
export function calculateEan8CheckDigit(digits7: string): number {
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    const d = parseInt(digits7[i], 10);
    sum += i % 2 === 0 ? d * 3 : d;
  }
  const mod = sum % 10;
  return mod === 0 ? 0 : 10 - mod;
}

// Check digit calculation for UPC-A
export function calculateUpcACheckDigit(digits11: string): number {
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const d = parseInt(digits11[i], 10);
    sum += i % 2 === 0 ? d * 3 : d;
  }
  const mod = sum % 10;
  return mod === 0 ? 0 : 10 - mod;
}

export const BARCODE_FORMATS: Record<BarcodeFormatId, BarcodeFormatMeta> = {
  ean13: {
    id: 'ean13',
    name: 'EAN-13',
    category: '1D Retail',
    bcid: 'ean13',
    example: '5901234123457',
    description: 'Worldwide retail standard (International Article Number) on consumer packaging.',
    requirements: '12 or 13 digits. If 12 digits are entered, the 13th checksum digit is computed.',
    industry: 'Global Retail & Point of Sale (POS)',
    validate: (val: string) => {
      const clean = val.replace(/[\s-]/g, '');
      if (!/^\d{12,13}$/.test(clean)) {
        return { valid: false, error: 'EAN-13 requires exactly 12 or 13 numeric digits.' };
      }
      if (clean.length === 13) {
        const expected = calculateEan13CheckDigit(clean.slice(0, 12));
        const actual = parseInt(clean[12], 10);
        if (expected !== actual) {
          return { valid: false, error: `Invalid checksum! Expected last digit to be ${expected}.` };
        }
      }
      return { valid: true };
    },
  },
  ean8: {
    id: 'ean8',
    name: 'EAN-8',
    category: '1D Retail',
    bcid: 'ean8',
    example: '96385074',
    description: 'Compact 8-digit retail barcode for small packages like confectionery or cosmetics.',
    requirements: '7 or 8 digits. If 7 digits are entered, the 8th checksum is automatically computed.',
    industry: 'Small Retail Packaging',
    validate: (val: string) => {
      const clean = val.replace(/[\s-]/g, '');
      if (!/^\d{7,8}$/.test(clean)) {
        return { valid: false, error: 'EAN-8 requires exactly 7 or 8 numeric digits.' };
      }
      if (clean.length === 8) {
        const expected = calculateEan8CheckDigit(clean.slice(0, 7));
        const actual = parseInt(clean[7], 10);
        if (expected !== actual) {
          return { valid: false, error: `Invalid checksum! Expected last digit to be ${expected}.` };
        }
      }
      return { valid: true };
    },
  },
  upca: {
    id: 'upca',
    name: 'UPC-A',
    category: '1D Retail',
    bcid: 'upca',
    example: '012345678905',
    description: 'Universal Product Code widely used in North American supermarkets and retail.',
    requirements: '11 or 12 digits. If 11 digits are entered, the 12th checksum is computed.',
    industry: 'North American Retail (USA / Canada)',
    validate: (val: string) => {
      const clean = val.replace(/[\s-]/g, '');
      if (!/^\d{11,12}$/.test(clean)) {
        return { valid: false, error: 'UPC-A requires exactly 11 or 12 numeric digits.' };
      }
      if (clean.length === 12) {
        const expected = calculateUpcACheckDigit(clean.slice(0, 11));
        const actual = parseInt(clean[11], 10);
        if (expected !== actual) {
          return { valid: false, error: `Invalid checksum! Expected last digit to be ${expected}.` };
        }
      }
      return { valid: true };
    },
  },
  upce: {
    id: 'upce',
    name: 'UPC-E',
    category: '1D Retail',
    bcid: 'upce',
    example: '01234565',
    description: 'Zero-suppressed compact version of UPC-A for small packages.',
    requirements: '7 or 8 numeric digits starting with 0 or 1. If 7 digits, checksum is computed.',
    industry: 'Small North American Retail Items',
    validate: (val: string) => {
      const clean = val.replace(/[\s-]/g, '');
      if (!/^\d{7,8}$/.test(clean)) {
        return { valid: false, error: 'UPC-E requires 7 or 8 numeric digits (e.g. 01234565).' };
      }
      if (!/^[01]/.test(clean)) {
        return { valid: false, error: 'UPC-E must start with number system digit 0 or 1.' };
      }
      return { valid: true };
    },
  },
  code128: {
    id: 'code128',
    name: 'CODE 128',
    category: '1D Standard',
    bcid: 'code128',
    example: 'QC-TOOL-2026-X9',
    description: 'High-density alphanumeric barcode supporting all 128 ASCII characters.',
    requirements: 'Any standard ASCII characters (letters, numbers, punctuation, spaces).',
    industry: 'Logistics, Shipping & Supply Chain Tracking',
    validate: (val: string) => {
      if (!val || val.trim().length === 0) {
        return { valid: false, error: 'CODE 128 requires at least one character.' };
      }
      // Check for valid ASCII
      if (!/^[\x00-\x7F]+$/.test(val)) {
        return { valid: false, error: 'CODE 128 only supports standard 7-bit ASCII characters.' };
      }
      return { valid: true };
    },
  },
  code39: {
    id: 'code39',
    name: 'CODE 39',
    category: '1D Standard',
    bcid: 'code39',
    example: 'PROD-84920',
    description: 'Classic industrial barcode supporting uppercase letters, digits, and basic symbols.',
    requirements: 'Uppercase A-Z, 0-9, spaces, and symbols (- . $ / + %).',
    industry: 'Manufacturing, Automotive, Defense & Government',
    validate: (val: string) => {
      const upper = val.toUpperCase();
      if (!upper || upper.length === 0) {
        return { valid: false, error: 'CODE 39 requires at least one character.' };
      }
      if (!/^[0-9A-Z\-. $/+%]+$/.test(upper)) {
        return {
          valid: false,
          error: 'CODE 39 only allows uppercase A-Z, digits 0-9, and characters: - . $ / + % or space.',
        };
      }
      return { valid: true };
    },
  },
  code93: {
    id: 'code93',
    name: 'CODE 93',
    category: '1D Standard',
    bcid: 'code93',
    example: 'LOGIST-9340-A',
    description: 'Compact evolution of Code 39 offering higher density and full ASCII coverage.',
    requirements: 'Alphanumeric and standard ASCII characters.',
    industry: 'Postal Services, Express Delivery & Tracking',
    validate: (val: string) => {
      if (!val || val.trim().length === 0) {
        return { valid: false, error: 'CODE 93 requires at least one character.' };
      }
      return { valid: true };
    },
  },
  itf: {
    id: 'itf',
    name: 'ITF (Interleaved 2 of 5)',
    category: '1D Standard',
    bcid: 'interleaved2of5',
    example: '10012345678902',
    description: 'High-density numeric-only barcode commonly used on corrugated shipping cartons.',
    requirements: 'Digits only (0-9). Must contain an even number of digits (e.g. 14 digits for ITF-14).',
    industry: 'Warehousing, Corrugated Cartons & Master Packs',
    validate: (val: string) => {
      const clean = val.replace(/[\s-]/g, '');
      if (!/^\d+$/.test(clean)) {
        return { valid: false, error: 'ITF allows digits 0-9 only.' };
      }
      if (clean.length % 2 !== 0) {
        return {
          valid: false,
          error: `ITF requires an EVEN number of digits (currently ${clean.length}). Add a leading 0 if needed.`,
        };
      }
      return { valid: true };
    },
  },
  codabar: {
    id: 'codabar',
    name: 'CODABAR',
    category: '1D Standard',
    bcid: 'rationalizedCodabar',
    example: 'A123456789B',
    description: 'Traditional self-checking barcode used in libraries, blood banks, and airbills.',
    requirements: 'Digits 0-9, symbols (- $ : / . +) with start/stop letters (A, B, C, or D).',
    industry: 'Blood Banks, Medical Labs, Libraries & FedEx Airbills',
    validate: (val: string) => {
      const clean = val.toUpperCase().replace(/\s/g, '');
      if (!clean) return { valid: false, error: 'CODABAR requires a value.' };
      if (!/^[ABCD][0-9\-$:/.+]+[ABCD]$/.test(clean)) {
        return {
          valid: false,
          error: 'CODABAR must start and end with A, B, C, or D, containing digits 0-9 and (- $ : / . +).',
        };
      }
      return { valid: true };
    },
  },
  pdf417: {
    id: 'pdf417',
    name: 'PDF417',
    category: '2D Matrix',
    bcid: 'pdf417',
    example: 'ID:8934021|NAME:DOE,JANE|CLASS:C|EXP:2028-12-31',
    description: 'High-capacity 2D stacked linear barcode capable of encoding over a kilobyte of data.',
    requirements: 'Any text, digits, or binary data up to 1,800 bytes.',
    industry: "Driver's Licenses, Airline Boarding Passes & Customs",
    validate: (val: string) => {
      if (!val || val.trim().length === 0) {
        return { valid: false, error: 'PDF417 requires input text.' };
      }
      return { valid: true };
    },
  },
  datamatrix: {
    id: 'datamatrix',
    name: 'DATA MATRIX',
    category: '2D Matrix',
    bcid: 'datamatrix',
    example: 'DM-PART-SERIAL-99281',
    description: 'Compact 2D matrix code ideal for small electronic components and medical devices.',
    requirements: 'Any text, digits, or binary data.',
    industry: 'Aerospace, Electronics Marking, Pharma & Medical Devices',
    validate: (val: string) => {
      if (!val || val.trim().length === 0) {
        return { valid: false, error: 'DATA MATRIX requires input text.' };
      }
      return { valid: true };
    },
  },
  aztec: {
    id: 'aztec',
    name: 'AZTEC',
    category: '2D Matrix',
    bcid: 'azteccode',
    example: 'TICKET-GATE-B4-FLIGHT-209',
    description: '2D matrix code featuring a central bullseye finder pattern, requiring no quiet zone.',
    requirements: 'Any text or binary payload.',
    industry: 'Railway Tickets, Airline Mobile Boarding Passes & Car Registration',
    validate: (val: string) => {
      if (!val || val.trim().length === 0) {
        return { valid: false, error: 'AZTEC requires input text.' };
      }
      return { valid: true };
    },
  },
};
