import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/axios"; // <-- Tambahkan import api axios

export default function AddAccountPage() {
  const navigate = useNavigate();

  // State untuk form
  const [accountName, setAccountName] = useState("OVO Pribadi");
  const [accountType, setAccountType] = useState("E-Wallet");
  const [balance, setBalance] = useState("");
  
  // State untuk memunculkan Popup dan Loading
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // <-- State loading API

  // Format ke Rupiah saat diketik
  const handleBalanceChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value === "") {
      setBalance("");
    } else {
      const formatted = new Intl.NumberFormat("id-ID").format(value);
      setBalance(formatted);
    }
  };

  // FUNGSI TEMBAK API KE LARAVEL
  const handleSaveAccount = async () => {
    if (!accountName || !balance) {
      alert("Nama akun dan saldo awal wajib diisi!");
      setShowPopup(false);
      return;
    }

    setIsSubmitting(true);
    try {
      // Hapus titik dari format Rupiah untuk dikirim ke database
      const rawBalance = balance.replace(/[^0-9]/g, ""); 
      
      // Payload sesuai kolom di backend
      const payload = {
        account_name: accountName,
        account_type: accountType,
        balance: parseInt(rawBalance, 10) || 0
      };

      await api.post('/accounts', payload); // Kirim POST request
      
      setShowPopup(false); // Tutup popup
      navigate('/accounts'); // Pindah ke halaman list akun
    } catch (error) {
      console.error("Gagal menyimpan akun:", error);
      alert("Terjadi kesalahan. Pastikan Anda sudah login dan server berjalan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Konfigurasi dinamis untuk Live Preview berdasarkan jenis akun
  const typeConfig = {
    "E-Wallet": {
      color: "text-[#9D51FA]",
      bg: "bg-[#F3E8FF]",
      accent: "bg-purple-50/50",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    "Bank": {
      color: "text-[#2D76F9]",
      bg: "bg-[#E8F0FE]",
      accent: "bg-blue-50/50",
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3L2 8V10H22V8L12 3ZM2 12H4V19H2V12ZM7 12H9V19H7V12ZM12 12H14V19H12V12ZM17 12H19V19H17V12ZM2 21H22V23H2V21Z" />
        </svg>
      )
    },
    "Tunai": {
      color: "text-[#22C55E]",
      bg: "bg-[#DCFCE7]",
      accent: "bg-green-50/50",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
      )
    }
  };

  const currentConfig = typeConfig[accountType];

  return (
    <MainLayout
      isLoading={false}
      title="Add Account"
      breadcrumbs={[
        { label: "Accounts", to: "/accounts" },
        { label: "Add Account" },
      ]}
    >
      {/* MODAL POPUP KONFIRMASI */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e293b]/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-7 w-full max-w-sm shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200">
            {/* Icon (mengacu pada gambar image_3baeb6.png) */}
            <div className="w-14 h-14 bg-[#9ff0c3] rounded-[16px] flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-[#064e3b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {/* Icon save/document plus */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-[#051C3A] mb-2 tracking-tight">
              Simpan Akun Baru?
            </h3>
            
            {/* Description menyesuaikan konteks Add Account */}
            <p className="text-gray-500 text-sm leading-relaxed mb-8 pr-2">
              Anda akan menyimpan akun "{accountName || "Baru"}". Tindakan ini akan menambahkan aset dan memperbarui total saldo Anda.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-5">
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-600 font-bold text-sm hover:text-gray-900 transition-colors"
              >
                Review
              </button>
              <button
                onClick={handleSaveAccount} // <-- Ubah menjadi trigger fungsi backend
                disabled={isSubmitting} // <-- Disable saat sedang loading
                className="bg-[#047857] hover:bg-[#065f46] text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 relative z-10">
        <p className="text-gray-400 text-sm">
          Kelola aset digital Anda dengan presisi atelier.
        </p>

        {/* Status Badge */}
        <div className="bg-[#E6F4EA] text-[#1E8E3E] px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold border border-[#1E8E3E]/10">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          Ready to save your new account.
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
        
        {/* LEFT COLUMN: FORM */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100/50">
            
            {/* Input Grid: Name & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Account Name */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Nama Akun
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-gray-800 text-sm rounded-xl px-4 py-3.5 outline-none border border-transparent focus:border-gray-200 transition-colors"
                  placeholder="Masukkan nama akun"
                />
                <p className="text-[10px] text-gray-400 mt-2">* Required field</p>
              </div>

              {/* Account Type (Dropdown Select) */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Jenis
                </label>
                <div className="relative">
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full appearance-none bg-[#F8FAFC] text-gray-800 text-sm rounded-xl px-4 py-3.5 outline-none border border-transparent focus:border-gray-200 transition-colors cursor-pointer"
                  >
                    <option value="E-Wallet">E-Wallet</option>
                    <option value="Bank">Bank</option>
                    <option value="Tunai">Tunai</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Initial Balance */}
            <div className="mb-10">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Saldo Awal
              </label>
              <div className="relative flex items-center bg-[#F8FAFC] rounded-xl overflow-hidden border border-transparent focus-within:border-gray-200 transition-colors">
                <span className="pl-4 pr-2 text-gray-500 font-medium">Rp</span>
                <input
                  type="text"
                  value={balance}
                  onChange={handleBalanceChange}
                  placeholder="0"
                  className="w-full bg-transparent text-gray-800 text-sm py-3.5 pr-4 outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowPopup(true)} // Tampilkan Popup saat di klik
                className="bg-[#051C3A] hover:bg-[#0a2752] transition-colors text-white font-semibold py-3 px-8 rounded-xl text-sm shadow-md shadow-[#051C3A]/20"
              >
                Simpan Akun
              </button>
              <button 
                onClick={() => navigate('/accounts')}
                className="text-gray-600 font-semibold py-3 px-6 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW & SECURITY */}
        <div className="xl:col-span-1 flex flex-col">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">
            Live Preview
          </h3>
          
          {/* Live Preview Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100/50 mb-6 relative overflow-hidden transition-all duration-300">
            <div className={`absolute top-0 right-0 w-32 h-32 ${currentConfig.accent} rounded-bl-full pointer-events-none transition-colors duration-300`}></div>
            
            <div className={`w-14 h-14 rounded-2xl ${currentConfig.bg} ${currentConfig.color} flex items-center justify-center mb-5 transition-colors duration-300`}>
              {currentConfig.icon}
            </div>
            
            <p className={`text-[11px] font-bold ${currentConfig.color} tracking-wider uppercase mb-1 transition-colors duration-300`}>
              {accountType}
            </p>
            <h3 className="text-xl font-bold text-[#051C3A] truncate">
              {accountName || "Nama Akun"}
            </h3>
            <p className="text-3xl font-bold text-[#051C3A] mt-2 mb-8">
              Rp {balance || "0"}
            </p>
            
            <div className="border-t border-gray-100 pt-5 flex justify-between items-center text-xs">
              <span className="text-gray-400 font-medium">Verified Account</span>
              <span className="flex items-center gap-1.5 font-semibold text-[#10B981]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> Terhubung
              </span>
            </div>
          </div>

          {/* Security Priority Info */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.03)] border border-gray-100/50 flex gap-4 items-start">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#1E8E3E]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4zm-2 16l-4-4 1.41-1.41L10 15.17l6.59-6.59L18 10l-8 8z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-[#051C3A] mb-1">Keamanan Prioritas</h4>
              <p className="text-xs text-gray-500 leading-relaxed pr-2">
                Informasi akun Anda dienkripsi menggunakan standar keamanan perbankan global.
              </p>
            </div>
          </div>

        </div>

      </div>
    </MainLayout>
  );
}