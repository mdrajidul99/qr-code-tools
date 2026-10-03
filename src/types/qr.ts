export type QrType =
  | 'url'
  | 'text'
  | 'wifi'
  | 'email'
  | 'phone'
  | 'sms'
  | 'vcard'
  | 'location'
  | 'event'
  | 'whatsapp'
  | 'crypto';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrOptions {
  fgColor: string;
  bgColor: string;
  size: number;
  margin: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  dotStyle: 'square' | 'rounded' | 'dots';
  logoUrl?: string;
  logoSize: number; // percentage 10 - 30
}

export interface WifiData {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface EmailData {
  email: string;
  subject: string;
  body: string;
}

export interface SmsData {
  phone: string;
  message: string;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  organization: string;
  jobTitle: string;
  phone: string;
  email: string;
  website: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  notes: string;
}

export interface LocationData {
  latitude: string;
  longitude: string;
  query: string;
}

export interface EventData {
  title: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  description: string;
}

export interface WhatsAppData {
  phone: string;
  message: string;
}

export interface CryptoData {
  coin: 'bitcoin' | 'ethereum' | 'solana' | 'usdt' | 'litecoin' | 'dogecoin';
  address: string;
  amount: string;
  label: string;
}
