import React, { useState } from 'react';
import { copyTextToClipboard } from '../../utils/downloadUtils';
import { BackButton } from '../common/BackButton';
import { Mail, Copy, Send, Check, ShieldCheck } from 'lucide-react';

interface ContactPageProps {
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onBack?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNotify, onBack }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const emailAddress = 'mrs.engineers.bd26@gmail.com';

  const handleCopyEmail = async () => {
    const ok = await copyTextToClipboard(emailAddress);
    if (ok) {
      onNotify('Email address copied to clipboard!', 'success');
    }
  };

  const handleOpenMailClient = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (subject.trim()) params.set('subject', subject.trim());
    if (message.trim()) params.set('body', message.trim());
    const query = params.toString() ? `?${params.toString()}` : '';
    window.location.href = `mailto:${emailAddress}${query}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <BackButton onBack={onBack} label="Back to Home" />
      </div>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Contact Us
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Have questions, technical suggestions, or feedback? Get in touch with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Direct Email Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Direct Developer Contact
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Developed by MRS Engineers BD
            </p>
          </div>

          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider block font-mono">
              Support & Inquiries Email
            </span>
            <span className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white font-mono break-all">
              {emailAddress}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href={`mailto:${emailAddress}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Email</span>
            </a>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          </div>
        </div>

        {/* Client-Side Email Launcher Form */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Compose Message
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Launches your local email app with your message prefilled.
            </p>
          </div>

          <form onSubmit={handleOpenMailClient} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Feedback on QR Code Tools"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Message
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your suggestions or inquiry details..."
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Open in Email App</span>
            </button>
          </form>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/60 flex items-start gap-3 text-xs text-neutral-700 dark:text-neutral-300">
        <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Because QR Code Tools is a purely static, client-side web application hosted without a tracking database or backend server, all inquiries are delivered directly to our primary developer inbox via standard email.
        </p>
      </div>
    </div>
  );
};
