import React from "react";

export default function TermsModal({ isOpen, onClose }) {
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
            Terms of Services
          </h2>
          <p className="text-[#E2E8F0] font-medium tracking-wide">
            Have questions or need help? Get in touch with us!
          </p>
        </div>

        <div className="text-[#1F2937] leading-relaxed text-sm md:text-base px-2 md:px-6">
          <p className="font-bold mb-4">
            By accessing or using WealthWise, you agree to comply with and be bound by the following terms and conditions:
          </p>
          <ul className="space-y-4 list-disc pl-5 marker:text-gray-400">
            <li><b className="font-bold">Service Overview:</b> WealthWise is a digital platform designed for personal finance management, including expense tracking, budgeting, and category organization. The service is provided "as is" for your personal, non-commercial use.</li>
            <li><b className="font-bold">User Eligibility:</b> You must provide accurate and complete information during registration. You are solely responsible for any activity that occurs under your account and for maintaining the security of your password.</li>
            <li><b className="font-bold">Financial Disclaimer:</b> WealthWise is an administrative tool only. We do not provide professional financial advice, auditing, or tax services. Any calculations or insights provided are for informational purposes; always consult with a certified professional for significant financial decisions.</li>
            <li><b className="font-bold">Acceptable Use:</b> You agree not to misuse the service by attempting to bypass security measures, injecting malicious code, or using the platform for any illegal financial transactions or fraudulent activities.</li>
            <li><b className="font-bold">Termination:</b> We reserve the right to suspend or terminate your access to the service at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users or our business interests.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
