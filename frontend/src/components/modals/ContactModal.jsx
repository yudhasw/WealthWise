import React from "react";

export default function ContactModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 z-[110] bg-white/20 hover:bg-white/40 text-white backdrop-blur-md rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Bagian Atas: Peta Cover */}
        <div className="w-full h-48 bg-slate-800 relative shadow-inner">
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Map Cover"
            className="w-full h-full object-cover opacity-70 mix-blend-screen"
          />
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(239,68,68,1)] flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Bagian Bawah: Info List */}
        <div className="p-8 flex flex-col items-center">
          <h2 className="text-3xl font-extrabold text-[#051C3A] mb-2 tracking-tight">Get in Touch</h2>
          <p className="text-gray-500 text-sm mb-8 text-center">
            We'd love to hear from you. You can reach us via the following details.
          </p>

          <div className="flex flex-col gap-4 w-full">

            {/* Address Item */}
            <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-2xl border border-gray-100 hover:border-emerald-100 transition-colors">
              <div className="w-12 h-12 rounded-full bg-emerald-100/50 text-emerald-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 tracking-wider">Office Address</p>
                <p className="font-bold text-[#051C3A] text-sm">Jl. Lorem Ipsum No. 123</p>
              </div>
            </div>

            {/* Phone Item */}
            <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 tracking-wider">Phone Number</p>
                <p className="font-bold text-[#051C3A] text-sm">+62 812 3456 7890</p>
              </div>
            </div>

            {/* Email Item */}
            <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-2xl border border-gray-100 hover:border-purple-100 transition-colors">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 tracking-wider">Email Support</p>
                <p className="font-bold text-[#051C3A] text-sm">wlw@wlw.com</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
