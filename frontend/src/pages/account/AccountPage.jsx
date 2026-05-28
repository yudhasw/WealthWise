import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import Header from "../../components/Header";
import { Link } from "react-router-dom";
import { Bell, User, Pencil, Trash2 } from "lucide-react";
import api from "../../api/axios";

export default function AccountPage() {
  const navigate = useNavigate();

  // 1. STATE UNTUK MENYIMPAN DATA
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState({
    total_balance: 0,
    distribution: { Bank: 0, "E-Wallet": 0, Tunai: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  // State HANYA untuk Modal Delete (Popup Edit SUDAH DIHAPUS)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 2. FUNGSI FETCH DATA
  const fetchAccounts = async () => {
    try {
      const response = await api.get("/accounts");
      const dataArray = response.data.data
        ? response.data.data.accounts
        : response.data;

      const accountsData = Array.isArray(dataArray) ? dataArray : [];
      setAccounts(accountsData);

      // Kalkulasi Total dan Distribusi
      let total = 0;
      let dist = { Bank: 0, "E-Wallet": 0, Tunai: 0 };

      accountsData.forEach((acc) => {
        const bal = Number(acc.balance);
        total += bal;

        const typeUpper = (acc.account_type || "").toUpperCase();
        const validBal = bal > 0 ? bal : 0;

        if (typeUpper.includes("BANK")) {
          dist.Bank += validBal;
        } else if (typeUpper.includes("WALLET")) {
          dist["E-Wallet"] += validBal;
        } else {
          dist.Tunai += validBal;
        }
      });

      let distPercent = { Bank: 0, "E-Wallet": 0, Tunai: 0 };
      const totalDist = dist.Bank + dist["E-Wallet"] + dist.Tunai;

      if (totalDist > 0) {
        distPercent.Bank = Math.round((dist.Bank / totalDist) * 100);
        distPercent["E-Wallet"] = Math.round(
          (dist["E-Wallet"] / totalDist) * 100,
        );
        distPercent.Tunai = Math.round((dist.Tunai / totalDist) * 100);
      }

      setSummary({ total_balance: total, distribution: distPercent });
    } catch (error) {
      console.error("Gagal mengambil data akun:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // ==========================================
  // FUNGSI AKSI: HAPUS SAJA
  // ==========================================

  const handleDeleteClick = (account) => {
    setSelectedAccount(account);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsProcessing(true);
    try {
      await api.delete(`/accounts/${selectedAccount.id}`);
      setShowDeleteModal(false);
      fetchAccounts(); // Refresh data setelah dihapus
    } catch (error) {
      console.error("Gagal menghapus akun:", error);
      alert("Gagal menghapus akun.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // HELPER FORMAT & UI
  // ==========================================

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getCardConfig = (rawType) => {
    const typeUpper = (rawType || "").toUpperCase();
    if (typeUpper.includes("BANK")) {
      return {
        normalizedName: "Bank",
        wrapperShadow: "shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]",
        accentBg: "bg-blue-50/50",
        iconBoxBg: "bg-[#E8F0FE]",
        iconColor: "text-[#2D76F9]",
        iconSvg: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3L2 8V10H22V8L12 3ZM2 12H4V19H2V12ZM7 12H9V19H7V12ZM12 12H14V19H12V12ZM17 12H19V19H17V12ZM2 21H22V23H2V21Z" />
          </svg>
        ),
        textColor: "text-[#2D76F9]",
        statusText: "Terhubung",
        statusColor: "text-[#10B981]",
        showDot: true,
      };
    } else if (typeUpper.includes("WALLET")) {
      return {
        normalizedName: "E-Wallet",
        wrapperShadow: "shadow-[0_2px_10px_-3px_rgba(157,81,250,0.05)]",
        accentBg: "bg-purple-50/50",
        iconBoxBg: "bg-[#F3E8FF]",
        iconColor: "text-[#9D51FA]",
        iconSvg: (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        ),
        textColor: "text-[#9D51FA]",
        statusText: "Terhubung",
        statusColor: "text-[#10B981]",
        statusDot: "bg-[#10B981]",
      };
    } else {
      return {
        normalizedName: "Tunai",
        wrapperShadow: "shadow-[0_2px_10px_-3px_rgba(34,197,94,0.05)]",
        accentBg: "bg-green-50/50",
        iconBoxBg: "bg-[#DCFCE7]",
        iconColor: "text-[#22C55E]",
        iconSvg: (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
            />
          </svg>
        ),
        textColor: "text-[#22C55E]",
        statusText: "Manual update",
        statusColor: "text-gray-400",
        showDot: false,
      };
    }
  };

  const distConfig = {
    Bank: { dot: "bg-[#3B82F6]", bar: "bg-[#E0E7FF]" },
    "E-Wallet": { dot: "bg-[#A855F7]", bar: "bg-[#F3E8FF]" },
    Tunai: { dot: "bg-[#22C55E]", bar: "bg-[#DCFCE7]" },
  };

  return (
    <MainLayout isLoading={isLoading}>
      {/* ======================= MODAL HAPUS ======================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e293b]/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-7 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
            <div className="w-14 h-14 bg-red-100 rounded-[16px] flex items-center justify-center mb-5 text-red-600">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#051C3A] mb-2">
              Hapus Akun?
            </h3>
            <p className="text-gray-500 text-sm mb-8">
              Akun <b>{selectedAccount?.account_name}</b> akan dihapus secara
              permanen beserta semua transaksinya.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-600 font-bold text-sm hover:text-gray-900 px-4"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={isProcessing}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm disabled:opacity-50"
              >
                {isProcessing ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <Header
        title="Accounts"
        rightSection={
          <div className="flex items-center gap-5">
            <Link
              to="/notifications"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Bell size={18} />
            </Link>

            <Link
              to="/profile"
              className="w-10 h-10 rounded-full bg-[#1F2937] border border-white/10 flex items-center justify-center hover:bg-[#374151] transition"
            >
              <User size={18} className="text-[#F4B183]" />
            </Link>
          </div>
        }
      />

      {/* TOTAL SALDO CARD */}
      <div className="bg-[#051C3A] rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-xl flex flex-col justify-center mb-10">
        <div className="absolute right-[-5%] top-[-20%] w-64 h-64 md:w-80 md:h-80 bg-white/5 rounded-full blur-sm pointer-events-none"></div>
        <div className="relative z-10">
          <p className="text-[10px] md:text-xs font-bold text-blue-200/60 tracking-[0.15em] mb-3 uppercase">
            Total Saldo Keseluruhan
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-5 tracking-tight">
            {formatRupiah(summary.total_balance)}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="inline-flex items-center gap-1 bg-[#1A4B41]/80 text-[#34D399] text-xs font-semibold px-2.5 py-1 rounded-md">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 15l7-7 7 7"
                />
              </svg>
              Sinkronisasi API Aktif
            </span>
          </div>
        </div>
      </div>

      {/* SECTION: DAFTAR AKUN ASET */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Daftar Akun Aset
          </h2>
          <p className="text-sm text-gray-500">
            Kelola perbankan, dompet digital, dan dana tunai Anda.
          </p>
        </div>
        <button
          onClick={() => navigate("/accounts/add")}
          className="bg-[#0D7A5B] hover:bg-[#0a6349] transition-colors text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Tambah Akun Baru
        </button>
      </div>

      {/* CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {accounts.map((acc) => {
          const style = getCardConfig(acc.account_type);
          return (
            <div
              key={acc.id}
              className={`bg-white rounded-2xl p-6 border border-gray-100 ${style.wrapperShadow} relative group`}
            >
              {/* Dekorasi Pojok Kanan Atas - Diturunkan z-indexnya agar tidak menimpa apapun */}
              <div
                className={`absolute top-0 right-0 w-24 h-24 ${style.accentBg} rounded-bl-full pointer-events-none z-0`}
              ></div>

              {/* HEADER KARTU: Berisi Ikon Akun & Tombol Aksi Bersandingan */}
              <div className="flex justify-between items-start mb-5 relative z-10">
                {/* Kotak Ikon Jenis Akun */}
                <div
                  className={`w-12 h-12 rounded-xl ${style.iconBoxBg} ${style.iconColor} flex items-center justify-center`}
                >
                  {style.iconSvg}
                </div>

                {/* TOMBOL AKSI EDIT & HAPUS: Dipindah ke Flex Row agar Pasti Terlihat */}
                <div className="flex gap-2">
                  {/* TOMBOL EDIT */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/accounts/edit/${acc.id}`);
                    }}
                    className="p-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 bg-gray-50 border border-gray-200 rounded-xl shadow-sm flex items-center justify-center transition-all duration-200"
                    title="Edit Akun"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>

                  {/* TOMBOL HAPUS */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(acc);
                    }}
                    className="p-2 text-slate-700 hover:text-red-600 hover:bg-red-50 bg-gray-50 border border-gray-200 rounded-xl shadow-sm flex items-center justify-center transition-all duration-200"
                    title="Hapus Akun"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* INFORMASI NAMA & SALDO */}
              <div className="relative z-10">
                <p
                  className={`text-[10px] font-bold ${style.textColor} tracking-wider uppercase mb-1`}
                >
                  {style.normalizedName}
                </p>
                <h3 className="text-lg font-bold text-gray-900 truncate max-w-full">
                  {acc.account_name}
                </h3>

                <p
                  className={`text-2xl font-bold mt-2 mb-5 ${Number(acc.balance) < 0 ? "text-red-500" : "text-[#051C3A]"}`}
                >
                  {formatRupiah(acc.balance)}
                </p>
              </div>

              {/* FOOTER KARTU */}
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-xs relative z-10">
                <span className="text-gray-500">My Account</span>
                <span
                  className={`flex items-center gap-1.5 font-medium ${style.statusColor}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${style.statusDot}`}
                  ></span>{" "}
                  {style.statusText}
                </span>
              </div>
            </div>
          );
        })}

        {/* Card Punya akun lain? */}
        <div
          onClick={() => navigate("/accounts/add")}
          className="bg-[#F8FAFC]/50 rounded-2xl p-6 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 mb-4 shadow-sm">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-gray-800 mb-1">
            Punya akun lain?
          </h3>
          <p className="text-xs text-gray-500 px-2">
            Tambahkan akun bank atau e-wallet lainnya.
          </p>
        </div>
      </div>

      {/* DISTRIBUSI ASET SECTION */}
      <div className="bg-[#F8FAFC] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Distribusi Aset
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Gambaran bagaimana dana Anda tersebar di berbagai jenis akun.
          </p>
          <div className="flex flex-col gap-3">
            {Object.entries(summary.distribution).map(([type, percent]) => {
              const typeStyle = distConfig[type] || {
                dot: "bg-gray-500",
                bar: "bg-gray-200",
              };
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${typeStyle.dot}`}
                    ></span>
                    <span className="text-sm font-medium text-gray-700">
                      {type}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {percent}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full md:w-2/3 bg-white rounded-2xl p-6 shadow-sm min-h-[200px] flex items-end justify-center gap-3 md:gap-6 overflow-hidden">
          {Object.entries(summary.distribution).map(([type, percent]) => {
            const barBg = distConfig[type]?.bar || "bg-gray-200";
            return (
              <div
                key={type}
                className={`w-12 md:w-16 ${barBg} rounded-t-lg transition-all duration-1000`}
                style={{ height: `${percent > 0 ? percent : 5}%` }}
                title={`${type}: ${percent}%`}
              ></div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
