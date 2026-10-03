import React from 'react';
import { BackButton } from '../common/BackButton';
import { Scale, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface TermsPageProps {
  onBack?: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <BackButton onBack={onBack} label="Back to Home" />
      </div>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Terms & Conditions
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          Last Updated: October 2026
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-6">
        <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-600" />
            <span>1. Acceptance of Terms</span>
          </h2>
          <p>
            By accessing or using <strong>QR Code Tools</strong> (the "Service"), developed and maintained by <strong>MRS Engineers BD</strong>, you agree to be bound by these Terms & Conditions. If you disagree with any part of these terms, please do not use the website.
          </p>
        </section>

        <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>2. Permitted Use & Free Access</span>
          </h2>
          <p>
            QR Code Tools is provided free of charge for personal, educational, and commercial purposes. You may generate, customize, download, distribute, and print QR codes and barcodes created with our service without requiring licensing payments or attribution.
          </p>
        </section>

        <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>3. Acceptable Use & User Responsibility</span>
          </h2>
          <p>
            You agree not to use the Service to generate QR codes, barcodes, or links intended for:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Distributing malicious software, viruses, phishing schemes, or spyware;</li>
            <li>Fraudulent or misleading commercial practices;</li>
            <li>Defamatory, abusive, threatening, or illegal activities;</li>
            <li>Infringing on intellectual property or trademark rights of third parties.</li>
          </ul>
          <p>
            You are exclusively responsible for the content, validity, and destination URLs encoded into any QR codes or barcodes you generate.
          </p>
        </section>

        <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>4. Verification & Printing Disclaimer</span>
          </h2>
          <p>
            <strong>Crucial Verification Notice:</strong> Before initiating mass commercial printing, packaging runs, or marketing distribution of any generated QR code or barcode, <em>you must test and verify the code using multiple physical scanners, mobile device cameras, and barcode reading hardware under real-world lighting conditions</em>.
          </p>
          <p>
            While our tools follow international symbology specifications (ISO/IEC 18004 for QR codes, GS1 guidelines for EAN/UPC, ISO/IEC 15417 for Code 128, etc.), user customization choices (such as low color contrast, embedded logos, or extreme quiet zone reductions) can impact scanning performance. We accept no liability for misprinted packaging, batch inventory errors, or unreadable promotional materials.
          </p>
        </section>

        <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            5. Scanner Limitations
          </h2>
          <p>
            Our web-based QR Code and Barcode Scanners rely on browser APIs, device camera resolution, lens focus, ambient lighting, and open-source decoding libraries. We do not guarantee that all damaged, distorted, curved, or low-resolution barcodes can be decoded in every environment.
          </p>
        </section>

        <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            6. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by applicable law, MRS Engineers BD shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from the use of, or inability to use, this website or any generated materials. The service is provided "as is" and "as available" without warranties of any kind.
          </p>
        </section>

        <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            7. Contact Information
          </h2>
          <p>
            For any questions or legal inquiries regarding these Terms & Conditions, please contact:
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
