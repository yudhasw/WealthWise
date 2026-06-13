import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Import gambar dari assets (Pastikan path-nya benar)
import landingImage1 from "../../assets/fiture1landingpage.jpeg";
import landingImage2 from "../../assets/fiture2landingpage.jpg";
import logo from "../../assets/logo.png";

// Import modal components
import TermsModal from "../../components/modals/TermsModal";
import PrivacyModal from "../../components/modals/PrivacyModal";
import ContactModal from "../../components/modals/ContactModal";

export default function LandingPage() {
  const navigate = useNavigate();
  
  // State untuk animasi hover tombol Login/Register
  const [hoverAuth, setHoverAuth] = useState("register");
  
  // State untuk Popups
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="min-h-screen font-sans selection:bg-emerald-500 selection:text-white flex flex-col relative">
      
      {/* ======================= MODALS ======================= */}
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />
      {/* ======================================================== */}


      {/* NAVBAR */}
      <nav className="w-full bg-[#0B644B] px-6 lg:px-12 py-4 flex justify-between items-center z-50 shadow-md">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
          <img
            src={logo}
            alt="WealthWise Logo"
            className="w-9 h-9 rounded-full transition-transform duration-300 group-hover:rotate-12"
          />
          <div className="leading-tight">
            <h1 className="text-xl font-bold text-emerald-500 tracking-tight leading-tight">
              WealthWise
            </h1>
            <p className="text-[10px] text-gray-400 tracking-widest uppercase">
              Financial Atelier
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-emerald-100 hover:text-white hover:-translate-y-0.5 transition-all duration-300">Features</a>
        </div>

        <div
          className="flex items-center p-1 bg-[#09503c] rounded-full border border-emerald-700/50 shadow-inner"
          onMouseLeave={() => setHoverAuth("register")}
        >
          <button
            onMouseEnter={() => setHoverAuth("login")}
            onClick={() => navigate("/login")}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              hoverAuth === "login"
                ? "bg-white text-[#0B644B] shadow-md scale-100"
                : "text-emerald-100 hover:text-white scale-95"
            }`}
          >
            Login
          </button>

          <button
            onMouseEnter={() => setHoverAuth("register")}
            onClick={() => navigate("/register")}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              hoverAuth === "register"
                ? "bg-white text-[#0B644B] shadow-md scale-100"
                : "text-emerald-100 hover:text-white scale-95"
            }`}
          >
            Register
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-[#16181C] w-full pt-20 pb-28 px-6 lg:px-12 relative overflow-hidden flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 px-4 py-1.5 rounded-full text-[11px] font-medium tracking-wide uppercase mb-6 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              The New Standard in Wealth Management
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[72px] font-extrabold text-white tracking-tight leading-[1.05] mb-6">
              Master Your <br /> Wealth <br />
              <span className="text-[#10B981]">With Precision.</span>
            </h1>

            <p className="text-gray-400 text-base md:text-lg max-w-lg mb-10 leading-relaxed">
              Experience the financial atelier. Curate your assets, track intelligent
              insights, and navigate your financial journey with editorial clarity.
            </p>

            <button
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-[#0B644B] to-[#10B981] text-white px-8 py-3.5 rounded-xl text-base font-bold transition-all duration-300 shadow-lg shadow-emerald-900/30 hover:from-[#094d3a] hover:to-[#059669] hover:shadow-emerald-500/40 hover:-translate-y-1 hover:scale-105 active:scale-95"
            >
              Get Started
            </button>
          </div>

          <div className="relative w-full max-w-lg mx-auto lg:mr-0 mt-10 lg:mt-0">
            <div className="w-full aspect-[4/3] bg-[#1E293B] rounded-[2rem] border-4 border-[#2A2D35] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-3 md:p-4 relative group hover:border-[#10B981]/50 transition-colors duration-500">
               <div className="w-full h-full overflow-hidden rounded-[20px] relative bg-black">
                 <img 
                   src={landingImage1} 
                   alt="WealthWise Showcase" 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                 />
                 <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] pointer-events-none"></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="bg-[#F8FAFC] w-full py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div className="order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#051C3A] mb-4">Features</h2>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-10 max-w-md">
              Beyond tracking. WealthWise uses advanced algorithms to actively project and protect your financial future.
            </p>

            <div className="flex flex-col gap-8">
              <div className="flex gap-4 items-start group">
                <div className="w-6 h-6 mt-0.5 text-[#0B644B] shrink-0 transition-transform duration-300 group-hover:scale-125">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><circle cx="12" cy="12" r="9" strokeOpacity="0.2" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></svg>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#051C3A] mb-1 group-hover:text-[#0B644B] transition-colors">Smart Planning & Budgeting</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Dynamic budgets that adapt to your spending patterns and market conditions.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start group">
                <div className="w-6 h-6 mt-0.5 text-[#0B644B] shrink-0 transition-transform duration-300 group-hover:scale-125">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#051C3A] mb-1 group-hover:text-[#0B644B] transition-colors">Computer Vision Receipts</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Snap a photo. Our AI instantly extracts line items, dates, and vendors with zero manual entry.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start group">
                <div className="w-6 h-6 mt-0.5 text-[#0B644B] shrink-0 transition-transform duration-300 group-hover:scale-125">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#051C3A] mb-1 group-hover:text-[#0B644B] transition-colors">Financial Health Status</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">A real-time holistic score based on liquidity, debt-to-income, and asset diversification.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="w-full max-w-[500px] aspect-[4/3] bg-white rounded-[2rem] shadow-xl border border-gray-100 p-3 md:p-4 relative group hover:border-[#10B981]/30 hover:shadow-2xl hover:shadow-[#10B981]/10 transition-all duration-500 hover:-translate-y-2">
               <div className="w-full h-full overflow-hidden rounded-[20px] relative bg-black">
                 <img 
                   src={landingImage2} 
                   alt="WealthWise Features" 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                 />
                 <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none"></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-8 px-6 lg:px-12 mt-auto relative z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-[#051C3A] font-bold text-base mb-1">WealthWise</h3>
            <p className="text-[10px] text-gray-400">
              &copy; {new Date().getFullYear()} WealthWise Financial Atelier. Built for editorial precision.
            </p>
          </div>

          <div className="flex gap-6 text-[11px] font-medium text-gray-500">
            <span onClick={() => setShowPrivacy(true)} className="hover:text-[#0B644B] transition-colors cursor-pointer font-bold">Privacy</span>
            <span onClick={() => setShowTerms(true)} className="hover:text-[#0B644B] transition-colors cursor-pointer font-bold">Terms</span>
            <span onClick={() => setShowContact(true)} className="hover:text-[#0B644B] transition-colors cursor-pointer font-bold">Contact</span>
          </div>
        </div>
      </footer>

    </div>
  );
}