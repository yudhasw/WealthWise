import React from "react";

export default function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-[#FAFBFB] rounded-3xl p-8 md:p-12 w-full max-w-4xl shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-gray-200/50 hover:bg-gray-200 text-gray-500 hover:text-gray-800 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1F2937] mb-2 tracking-tight">
            Privacy Policy
          </h2>
          <p className="text-[#E2E8F0] font-medium tracking-wide">
            Have questions or need help? Get in touch with us!
          </p>
        </div>

        <div className="text-[#1F2937] leading-relaxed text-sm md:text-base px-2 md:px-6">
          <p className="font-bold mb-4">
            We respect your privacy and are committed to protecting the personal data you share with us:
          </p>
          <ul className="space-y-4 list-disc pl-5 marker:text-gray-400">
            <li><b className="font-bold">Data Collection:</b> We collect information you provide directly, such as your name and email address, and data generated through your use of the app, including transaction history, budget limits, and custom financial categories.</li>
            <li><b className="font-bold">Purpose of Processing:</b> We process your data to personalize your dashboard, provide accurate financial reports, and improve the application's performance. If you opt-in, we may use your data to send service updates or security alerts.</li>
            <li><b className="font-bold">Data Sharing & Disclosure:</b> We do not sell your personal or financial information to third-party advertisers. Data may only be shared with essential service providers (e.g., cloud hosting) or when legally required by Indonesian law.</li>
            <li><b className="font-bold">Cookies and Tracking:</b> We may use cookies and similar tracking technologies to analyze app traffic and remember your preferences to provide a seamless user experience.</li>
            <li><b className="font-bold">Global Compliance:</b> While we are based in Indonesia, we strive to follow best practices in data protection to ensure your information is handled with the highest level of care.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
