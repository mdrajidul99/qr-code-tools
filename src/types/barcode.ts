export type BarcodeFormatId =
  | 'ean8'
  | 'ean13'
  | 'upce'
  | 'upca'
  | 'code39'
  | 'code93'
  | 'code128'
  | 'itf'
  | 'codabar'
  | 'pdf417'
  | 'datamatrix'
  | 'aztec';

export interface BarcodeFormatMeta {
  id: BarcodeFormatId;
  name: string;
  category: '1D Standard' | '1D Retail' | '2D Matrix';
  bcid: string; // bwip-js format identifier
  example: string;
  description: string;
  requirements: string;
  industry: string;
  validate: (val: string) => { valid: boolean; error?: string };
}

export interface BarcodeOptions {
  format: BarcodeFormatId;
  value: string;
  scale: number;
  height: number;
  includeText: boolean;
  barColor: string;
  bgColor: string;
  padding: number;
  fontSize: number;
}
