import React from "react";
import {
  Bell,
  Settings,
  ChevronRight,
  User,
  CreditCard,
  Wallet,
  BellRing,
} from "lucide-react";
import Sidebar from "../../layouts/Sidebar";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/axios";
import Header from "../../components/Header";

// ── Stats Card ────────────────────────────────────────────────────
function StatsCard({ label, value, sub, valueColor, bar, barColor, barPct }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
        {label}
      </p>
      <p
        className="text-xl font-black mb-2"
        style={{ color: valueColor ?? "#111827" }}
      >
        {value}
      </p>
      {bar ? (
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(barPct, 100)}%`,
              backgroundColor: barColor,
            }}
          />
        </div>
      ) : (
        sub && <p className="text-xs font-semibold text-emerald-500">{sub}</p>
      )}
    </div>
  );
}

// ── Settings Row ──────────────────────────────────────────────────
function SettingsRow({ label, display }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      <span className="w-28 text-gray-900 font-bold text-sm shrink-0">
        {label}
      </span>
      <span className="flex-1 text-gray-500 text-sm">{display}</span>
      <Link
        to="/profile/edit"
        className="text-gray-300 hover:text-emerald-600 transition-colors p-1 shrink-0"
      >
        <svg
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
          />
        </svg>
      </Link>
    </div>
  );
}

// ── Menu Item ─────────────────────────────────────────────────────
function MenuItem({ icon, title, desc, to }) {
  const inner = (
    <>
      <div className="w-10 h-10 bg-gray-100 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center shrink-0 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 font-bold text-sm">{title}</p>
        <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
      </div>
      <svg
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 shrink-0 transition-colors"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </>
  );

  const cls =
    "flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-emerald-200 hover:bg-emerald-50/40 transition-all text-left group w-full";

  return to ? (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  ) : (
    <button className={cls}>{inner}</button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/profile"), api.get("/dashboard")])
      .then(([profileRes, dashRes]) => {
        setProfile(profileRes.data.data);
        setSummary(dashRes.data.summary ?? {});
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (_) {}
    localStorage.removeItem("wealthwise_token");
    navigate("/login");
  };

  const fmt = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      notation: Math.abs(amount ?? 0) >= 1_000_000_000 ? "compact" : "standard",
    }).format(amount ?? 0);

  const initials =
    profile?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";
  const memberYear = profile?.member_since?.split(" ")?.[1] ?? "—";
  const income = summary?.total_income ?? 0;
  const expense = summary?.total_expense ?? 0;
  const expensePct = income > 0 ? (expense / income) * 100 : 0;

  return (
    <MainLayout isLoading={isLoading}>
      <Header
        title="Profile"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Profile" },
        ]}
        rightSection={
          <div className="flex items-center gap-5">
            <Link
              to="/notifications"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Bell size={18} />
            </Link>
          </div>
        }
      />
      {/* PROFILE HERO */}
      <div className="bg-white rounded-xl p-7 mb-4 border border-gray-100 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 border-4 border-emerald-400 flex items-center justify-center text-2xl font-black text-white select-none">
              {initials}
            </div>
            {profile?.email_verified_at && (
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3 h-3 text-white"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h2 className="text-2xl font-black text-gray-900">
                {profile?.name ?? "—"}
              </h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Wealth Management Client since {memberYear}
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                to="/profile/edit"
                className="bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
              >
                Edit Profile
              </Link>
              <button className="border-2 border-gray-200 text-gray-600 text-sm font-bold px-5 py-2.5 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors">
                Share Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FINANCIAL STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatsCard
          label="Total Balance"
          value={fmt(summary?.net_balance)}
          sub="▲ +2.4% this month"
          valueColor="#10b981"
        />
        <StatsCard
          label="Monthly Income"
          value={fmt(income)}
          bar
          barColor="#10b981"
          barPct={100}
        />
        <StatsCard
          label="Monthly Expenses"
          value={fmt(expense)}
          valueColor="#ef4444"
          bar
          barColor="#ef4444"
          barPct={expensePct}
        />
        <StatsCard
          label="Top Category"
          value={summary?.top_category ?? "—"}
          sub={`${profile?.stats?.total_transactions ?? 0} transactions`}
          valueColor="#8b5cf6"
        />
      </div>

      {/* SETTINGS MENU */}
      <div className="mb-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
          Account Settings
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
          <MenuItem
            to="/profile/edit"
            title="Personal Information"
            desc="Manage your name and account details"
            icon={
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            }
          />
          <MenuItem
            to="/categories"
            title="Categories"
            desc="Manage your transaction categories"
            icon={
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-gray-500"
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
            }
          />
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
          Preferences
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <MenuItem
            to="/accounts"
            title="Accounts"
            desc="View and manage your financial accounts"
            icon={
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.315 48.315 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                />
              </svg>
            }
          />
          <MenuItem
            to="/notifications"
            title="Notifications"
            desc="Alerts, reports, and marketing emails"
            icon={
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
            }
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 font-semibold text-sm transition-colors"
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            Sign Out
          </button>
          <button className="text-gray-500 hover:text-gray-700 font-semibold text-sm transition-colors">
            Help &amp; Support
          </button>
        </div>
        <span className="text-gray-300 text-xs font-medium">
          Version 1.0.0-stable
        </span>
      </div>
    </MainLayout>
  );
}
