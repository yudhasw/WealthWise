import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/axios";

export default function EditAccountPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State untuk form
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("Bank");
  const [balance, setBalance] = useState("");
  
  // State UI
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. FETCH DATA AKUN BERDASARKAN ID
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const response = await api.get(`/accounts/${id}`);
        const data = response.data.data || response.data; // Antisipasi perbedaan format response
        
        setAccountName(data.account_name);
        setAccountType(data.account_type);
        // Format saldo ke rupiah tanpa simbol untuk input
        setBalance(new Intl.NumberFormat("id-ID").format(Math.abs(data.balance)));
      } catch (error) {
        console.error("Gagal memuat data akun:", error);
        alert("Data akun tidak ditemukan.");
        navigate("/accounts");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccountData();
  }, [id, navigate]);

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

  // 2. FUNGSI UPDATE DATA (PUT)
  const handleUpdateAccount = async () => {
    if (!accountName || !balance) {
      alert("Nama akun dan saldo wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const rawBalance = balance.replace(/[^0-9]/g, ""); 
      
      const payload = {
        account_name: accountName,
        account_type: accountType,
        balance: parseInt(rawBalance, 10) || 0
      };

      await api.put(`/accounts/${id}`, payload);
      
      setShowPopup(false);
      navigate('/accounts');
    } catch (error) {
      console.error("Gagal memperbarui akun:", error);
      alert("Terjadi kesalahan saat memperbarui akun.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Konfigurasi dinamis untuk Live Preview
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
    "E_WALLET": { // Antisipasi jika DB pakai snake_case
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
    "BANK": { 
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
    },
    "CASH": {
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

  // Normalisasi config berdasarkan tipe (mengatasi case sensitive)
  const currentConfig = typeConfig[accountType] || typeConfig["Tunai"];

  return (
    <MainLayout
      isLoading={isLoading}
      title="Edit Account"
      breadcrumbs={[
        { label: "Accounts", to: "/accounts" },
        { label: "Edit Account" },
      ]}
    >
      {/* MODAL POPUP KONFIRMASI */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e293b]/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-7 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
            <div className="w-14 h-14 bg-blue-100 rounded-[16px] flex items-center justify-center mb-5 text-blue-600">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-[#051C3A] mb-2 tracking-tight">
              Simpan Perubahan?
            </h3>
            
            <p className="text-gray-500 text-sm leading-relaxed mb-8 pr-2">
              Data akun "{accountName}" akan diperbarui. Tindakan ini akan menyesuaikan catatan aset Anda.
            </p>

            <div className="flex items-center justify-end gap-5">
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-600 font-bold text-sm hover:text-gray-900 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateAccount}
                disabled={isSubmitting}
                className="bg-[#051C3A] hover:bg-[#0a2752] text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Memproses..." : "Update Akun"}
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-gray-400 text-sm mb-8">
        Sesuaikan informasi aset dan saldo Anda dengan presisi.
      </p>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
        
        {/* LEFT COLUMN: FORM */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100/50">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Nama Akun
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-gray-900 text-sm rounded-xl px-4 py-3.5 outline-none border border-gray-200 focus:border-[#051C3A] transition-colors"
                  placeholder="Nama akun"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Jenis
                </label>
                <div className="relative">
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full appearance-none bg-[#F8FAFC] text-gray-900 text-sm rounded-xl px-4 py-3.5 outline-none border border-gray-200 focus:border-[#051C3A] transition-colors cursor-pointer"
                  >
                    <option value="Bank">Bank</option>
                    <option value="E-Wallet">E-Wallet</option>
                    <option value="Tunai">Tunai</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Saldo Saat Ini
              </label>
              <div className="relative flex items-center bg-[#F8FAFC] rounded-xl overflow-hidden border border-gray-200 focus-within:border-[#051C3A] transition-colors">
                <span className="pl-4 pr-2 text-gray-700 font-bold text-sm">Rp</span>
                <input
                  type="text"
                  value={balance}
                  onChange={handleBalanceChange}
                  className="w-full bg-transparent text-gray-900 font-bold text-sm py-3.5 pr-4 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowPopup(true)}
                className="bg-[#051C3A] hover:bg-[#0a2752] transition-colors text-white font-semibold py-3 px-8 rounded-xl text-sm shadow-md"
              >
                Simpan Perubahan
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

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="xl:col-span-1">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">
            Preview Perubahan
          </h3>
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/50 mb-6 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 ${currentConfig.accent} rounded-bl-full pointer-events-none`}></div>
            
            <div className={`w-14 h-14 rounded-2xl ${currentConfig.bg} ${currentConfig.color} flex items-center justify-center mb-5`}>
              {currentConfig.icon}
            </div>
            
            <p className={`text-[11px] font-bold ${currentConfig.color} tracking-wider uppercase mb-1`}>
              {accountType}
            </p>
            <h3 className="text-xl font-bold text-[#051C3A] truncate">
              {accountName || "Nama Akun"}
            </h3>
            <p className="text-3xl font-bold text-[#051C3A] mt-2 mb-8">
              Rp {balance || "0"}
            </p>
            
            <div className="border-t border-gray-100 pt-5 flex justify-between items-center text-xs text-gray-400">
              <span>Editing active account...</span>
              <span className="flex items-center gap-1.5 font-semibold text-blue-500">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}