import {
  QrType,
  WifiData,
  EmailData,
  SmsData,
  VCardData,
  LocationData,
  EventData,
  WhatsAppData,
  CryptoData,
} from '../types/qr';

export function formatQrPayload(
  type: QrType,
  data: {
    url?: string;
    urls?: string[];
    text?: string;
    wifi?: WifiData;
    email?: EmailData;
    phone?: string;
    phones?: string[];
    sms?: SmsData;
    vcard?: VCardData;
    location?: LocationData;
    event?: EventData;
    whatsapp?: WhatsAppData;
    crypto?: CryptoData;
  }
): string {
  switch (type) {
    case 'url': {
      if (data.urls && data.urls.length > 1) {
        // Multi-url list formatted cleanly
        return data.urls
          .map((u) => u.trim())
          .filter((u) => u.length > 0)
          .map((u) => (!/^https?:\/\//i.test(u) ? `https://${u}` : u))
          .join('\n');
      }
      const rawUrl = ((data.urls && data.urls[0]) || data.url || '').trim();
      if (!rawUrl) return '';
      if (!/^https?:\/\//i.test(rawUrl)) {
        return `https://${rawUrl}`;
      }
      return rawUrl;
    }

    case 'text':
      return (data.text || '').trim();

    case 'wifi': {
      const wifi = data.wifi;
      if (!wifi || !wifi.ssid.trim()) return '';
      const ssid = wifi.ssid.replace(/([\\;,:"])/g, '\\$1');
      const pass = wifi.password.replace(/([\\;,:"])/g, '\\$1');
      return `WIFI:T:${wifi.encryption};S:${ssid};P:${pass};H:${wifi.hidden ? 'true' : 'false'};;`;
    }

    case 'email': {
      const em = data.email;
      if (!em || !em.email.trim()) return '';
      const params = new URLSearchParams();
      if (em.subject) params.set('subject', em.subject);
      if (em.body) params.set('body', em.body);
      const queryString = params.toString();
      return `mailto:${em.email.trim()}${queryString ? `?${queryString}` : ''}`;
    }

    case 'phone': {
      if (data.phones && data.phones.length > 1) {
        return data.phones
          .map((p) => p.trim().replace(/[^0-9+]/g, ''))
          .filter((p) => p.length > 0)
          .map((p) => `tel:${p}`)
          .join('\n');
      }
      const phone = ((data.phones && data.phones[0]) || data.phone || '').trim().replace(/[^0-9+]/g, '');
      return phone ? `tel:${phone}` : '';
    }

    case 'sms': {
      const sms = data.sms;
      if (!sms || !sms.phone.trim()) return '';
      const phone = sms.phone.trim().replace(/[^0-9+]/g, '');
      const msg = encodeURIComponent(sms.message || '');
      return `SMSTO:${phone}:${msg}`;
    }

    case 'vcard': {
      const v = data.vcard;
      if (!v) return '';
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${v.lastName || ''};${v.firstName || ''};;;`,
        `FN:${[v.firstName, v.lastName].filter(Boolean).join(' ') || 'Contact'}`,
      ];
      if (v.organization) lines.push(`ORG:${v.organization}`);
      if (v.jobTitle) lines.push(`TITLE:${v.jobTitle}`);
      if (v.phone) lines.push(`TEL;TYPE=CELL:${v.phone}`);
      if (v.email) lines.push(`EMAIL;TYPE=INTERNET:${v.email}`);
      if (v.website) lines.push(`URL:${v.website}`);
      if (v.street || v.city || v.state || v.zip || v.country) {
        lines.push(`ADR;TYPE=HOME:;;${v.street || ''};${v.city || ''};${v.state || ''};${v.zip || ''};${v.country || ''}`);
      }
      if (v.notes) lines.push(`NOTE:${v.notes}`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }

    case 'location': {
      const loc = data.location;
      if (!loc) return '';
      if (loc.latitude && loc.longitude) {
        return `geo:${loc.latitude.trim()},${loc.longitude.trim()}?q=${encodeURIComponent(
          loc.query || `${loc.latitude},${loc.longitude}`
        )}`;
      }
      if (loc.query) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.query.trim())}`;
      }
      return '';
    }

    case 'event': {
      const ev = data.event;
      if (!ev || !ev.title.trim()) return '';
      const formatICalDate = (dtStr: string) => {
        if (!dtStr) return '';
        const d = new Date(dtStr);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const start = formatICalDate(ev.startDateTime);
      const end = formatICalDate(ev.endDateTime);

      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//QR Code Tools//Event//EN',
        'BEGIN:VEVENT',
        `SUMMARY:${ev.title.trim()}`,
      ];
      if (start) lines.push(`DTSTART:${start}`);
      if (end) lines.push(`DTEND:${end}`);
      if (ev.location) lines.push(`LOCATION:${ev.location.trim()}`);
      if (ev.description) lines.push(`DESCRIPTION:${ev.description.trim()}`);
      lines.push('END:VEVENT');
      lines.push('END:VCALENDAR');
      return lines.join('\n');
    }

    case 'whatsapp': {
      const wa = data.whatsapp;
      if (!wa || !wa.phone.trim()) return '';
      const cleanPhone = wa.phone.replace(/[^0-9]/g, '');
      const encodedMsg = wa.message ? `?text=${encodeURIComponent(wa.message)}` : '';
      return `https://wa.me/${cleanPhone}${encodedMsg}`;
    }

    case 'crypto': {
      const c = data.crypto;
      if (!c || !c.address.trim()) return '';
      const addr = c.address.trim();
      const params = new URLSearchParams();
      if (c.amount && parseFloat(c.amount) > 0) params.set('amount', c.amount.trim());
      if (c.label) params.set('label', c.label.trim());
      const query = params.toString() ? `?${params.toString()}` : '';
      return `${c.coin}:${addr}${query}`;
    }

    default:
      return '';
  }
}
