import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import api from "../api/axios";
import logo from "../assets/logo.png";

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({
    financials: true,
    manage: true,
    analytics: true,
  });

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Gagal menghapus token di server", error);
    } finally {
      localStorage.removeItem("wealthwise_token");
      navigate("/login");
    }
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-[#2A2C30] border-r border-gray-800
        flex flex-col h-screen py-6 px-5
        overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:hidden"}
      `}
    >
      {/* Header / Logo */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-bold text-emerald-500 tracking-tight leading-tight">
              WealthWise
            </h1>
            <p className="text-[10px] text-gray-400 tracking-widest uppercase">
              Financial Atelier
            </p>
          </div>
        </div>

        {/* Close button - mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
        >
          <X size={18} />
        </button>
      </div>

      {/* Add Transaction */}
      <Link
        to="/transactions/add"
        onClick={onClose}
        className="w-full bg-[#0E7958] hover:bg-[#0b6348] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-6 transition-colors"
      >
        <svg
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        Add Transaction
      </Link>

      {/* Navigasi Utama */}
      <nav className="flex-1 space-y-1">
        {/* Dashboard */}
        <Link
          to="/dashboard"
          onClick={onClose}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
            isActive("/dashboard")
              ? "bg-[#F3F4F6] text-[#0E7958]"
              : "text-gray-300 hover:text-white hover:bg-gray-800/50"
          }`}
        >
          <svg fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5">
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h2v1H5zM3 13a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h2v1H5zM11 4a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm2 2V5h2v1h-2zM11 13a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3zm2 2v-1h2v1h-2z"
              clipRule="evenodd"
            />
          </svg>
          Dashboard
        </Link>

        {/* Section: Financials */}
        <div className="pt-2">
          <button
            onClick={() => toggleMenu("financials")}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white transition-colors"
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`w-4 h-4 transition-transform duration-200 ${openMenus.financials ? "rotate-0" : "-rotate-90"}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
            <span className="font-medium">Financials</span>
          </button>

          {openMenus.financials && (
            <div className="ml-11 mt-1 space-y-1">
              <Link
                to="/transactions"
                onClick={onClose}
                className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive("/transactions")
                    ? "bg-[#F3F4F6] text-[#0E7958]"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                  Transactions
                </span>
              </Link>
              <Link
                to="/smart-planning"
                onClick={onClose}
                className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive("/smart-planning")
                    ? "bg-[#F3F4F6] text-[#0E7958]"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                    />
                  </svg>
                  Smart Planning
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Section: Manage */}
        <div className="pt-2">
          <button
            onClick={() => toggleMenu("manage")}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white transition-colors"
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`w-4 h-4 transition-transform duration-200 ${openMenus.manage ? "rotate-0" : "-rotate-90"}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
            <span className="font-medium">Manage</span>
          </button>

          {openMenus.manage && (
            <div className="ml-11 mt-1 space-y-1">
              <Link
                to="/accounts"
                onClick={onClose}
                className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive("/accounts")
                    ? "bg-[#F3F4F6] text-[#0E7958]"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.315 48.315 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                    />
                  </svg>
                  Accounts
                </span>
              </Link>
              <Link
                to="/categories"
                onClick={onClose}
                className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive("/categories")
                    ? "bg-[#F3F4F6] text-[#0E7958]"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 6h.008v.008H6V6z"
                    />
                  </svg>
                  Categories
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Section: Analytics */}
        <div className="pt-2">
          <button
            onClick={() => toggleMenu("analytics")}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white transition-colors"
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`w-4 h-4 transition-transform duration-200 ${openMenus.analytics ? "rotate-0" : "-rotate-90"}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
            <span className="font-medium">Analytics</span>
          </button>

          {openMenus.analytics && (
            <div className="ml-11 mt-1 space-y-1">
              <Link
                to="/statistics"
                onClick={onClose}
                className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive("/statistics")
                    ? "bg-[#F3F4F6] text-[#0E7958]"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                  </svg>
                  Stats
                </span>
              </Link>
              <Link
                to="/financial-health"
                onClick={onClose}
                className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive("/financial-health")
                    ? "bg-[#F3F4F6] text-[#0E7958]"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                  Financial Health
                </span>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Support & Logout */}
      <div className="pt-6 mt-6 border-t border-gray-700 space-y-1">
        <Link
          to="/support"
          onClick={onClose}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white transition-colors rounded-xl hover:bg-gray-800/50"
        >
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
          <span className="font-medium text-sm">Support</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/10"
        >
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
            />
          </svg>
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
