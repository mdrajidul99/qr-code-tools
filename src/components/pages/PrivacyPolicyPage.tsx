import React from 'react';
import { BackButton } from '../common/BackButton';
import { ShieldCheck, Lock, EyeOff, Server, Cookie, HelpCircle } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack?: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <BackButton onBack={onBack} label="Back to Home" />
      </div>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          Last Updated: October 2026 · Effective Immediately
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-6">
        <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>1. Overview & Core Privacy Principles</span>
          </h2>
          <p>
            At <strong>QR Code Tools</strong>, operated by <strong>MRS Engineers BD</strong>, we believe that simple utility tools should never come at the expense of your personal privacy. Our website is engineered as a static, client-side application. We do not require accounts, signups, passwords, credit cards, or personal identifiers to access any of our generation or scanning features.
          </p>
        </section>

        <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>2. Information You Enter & Browser-Side Processing</span>
          </h2>
          <p>
            When you enter data to create a QR code or barcode—such as website URLs, plain text, Wi-Fi network names and passwords, contact details (vCards), calendar schedules, or phone numbers—<strong>this information is processed entirely inside your web browser</strong> using HTML5 canvas and client-side JavaScript.
          </p>
          <p>
            Your input data is <em>never sent to or stored on</em> our servers. Once you close your browser tab or click "Reset", the data is cleared from memory.
          </p>
        </section>

        <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-blue-600" />
            <span>3. Uploaded Images & Camera Access</span>
          </h2>
          <p>
            <strong>Image Uploads:</strong> When you select or drag-and-drop an image file (PNG, JPG, SVG) into our QR Code Scanner or Barcode Scanner, the image is parsed locally within your browser using the HTML5 File API and client-side decoding libraries. The file is never uploaded to any remote server or third-party storage.
          </p>
          <p>
            <strong>Camera Scanning:</strong> We only request camera permissions when you explicitly click the "Open Camera" button. The live video frames are analyzed locally on your device in real-time to detect codes. No video stream, screenshot, or audio is ever recorded, transmitted, or stored. You can stop camera access at any time using the "Stop Camera" button or through your browser settings.
          </p>
        </section>

        <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Cookie className="w-4 h-4 text-blue-600" />
            <span>4. Local Storage & Theme Preference</span>
          </h2>
          <p>
            We use the browser's standard <code>localStorage</code> mechanism solely to store your visual theme preference (Light Mode or Dark Mode) under the key <code>qr_theme</code>. This enables the website to remember your preference across visits. We do not store tracking cookies or session identifiers.
          </p>
        </section>

        <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600" />
            <span>5. Third-Party Advertising & Scripts</span>
          </h2>
          <p>
            To keep QR Code Tools 100% free for everyone without subscriptions or paywalls, we display advertisements provided by third-party advertising partners (such as High Revenue Format / Adsterra).
          </p>
          <p>
            These third-party ad networks may serve scripts or iframes that collect non-personally identifiable technical information (such as your IP address, browser type, device type, and referring URL) or set cookies to deliver relevant advertisements and measure ad performance according to their own privacy policies. We do not share your QR content, entered data, or scanner results with these advertising partners.
          </p>
        </section>

        <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            6. External Links
          </h2>
          <p>
            Our website may contain links to third-party websites or services (for example, when you scan a QR code containing an external URL). When you click an external link, you leave our site. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites.
          </p>
        </section>

        <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            7. Children’s Privacy
          </h2>
          <p>
            Our tools are designed for general audiences and do not knowingly collect or solicit any personal information from children under the age of 13.
          </p>
        </section>

        <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            8. Changes to This Privacy Policy
          </h2>
          <p>
            We may update our Privacy Policy periodically to reflect technological improvements or regulatory updates. Any changes will be posted on this page with an updated revision date.
          </p>
        </section>

        <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>9. Contact Us</span>
          </h2>
          <p>
            If you have any questions, inquiries, or concerns regarding this Privacy Policy, please contact:
          </p>
          <div className="text-xs space-y-1">
            <p><strong>Developer:</strong> MRS Engineers BD</p>
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:mrs.engineers.bd26@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                mrs.engineers.bd26@gmail.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
