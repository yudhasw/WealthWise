import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Bell, User, Menu } from "lucide-react";
import api from "../api/axios";
import { SidebarContext } from "../layouts/MainLayout";
import { getUnreadNotificationCount } from "../services/notificationService";

export default function Header({ title, rightSection, breadcrumbs }) {
  const { toggleSidebar } = useContext(SidebarContext);
  const [userName, setUserName] = useState(
    () => localStorage.getItem("wealthwise_user_name") || "",
  );
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api
      .get("/profile")
      .then((res) => {
        const name = res.data.data?.name || "";
        setUserName(name);
        localStorage.setItem("wealthwise_user_name", name);
      })
      .catch(() => {});

    getUnreadNotificationCount()
      .then(setUnreadCount)
      .catch(() => {});
  }, []);

  const firstName = userName.split(" ")[0];

  return (
    <header className="bg-[#191C1E] border-b border-white/5 flex items-center justify-between px-1 py-4 min-h-20">
      {/* HAMBURGER */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1.5 mb-1">
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-3 h-3 text-gray-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  )}
                  {crumb.to ? (
                    <Link
                      to={crumb.to}
                      className="text-xs text-gray-500 hover:text-emerald-400 transition-colors font-medium"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          <h1 className="text-[#0FA36B] text-3xl font-bold">{title}</h1>
        </div>
      </div>

      {/* RIGHT: Bell → [slot extra] → Divider → Nama + Avatar */}
      <div className="flex items-center gap-5">
        {/* NOTIFICATION */}
        <Link
          to="/notifications"
          className="relative text-gray-400 hover:text-white transition-colors"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* SLOT EXTRA — konten tambahan dari halaman (opsional) */}
        {rightSection}

        {/* DIVIDER */}
        <div className="h-8 w-px bg-white/10" />

        {/* NAMA + AVATAR */}
        <Link to="/profile" className="flex items-center gap-3 group">
          {firstName && (
            <span className="text-sm font-semibold text-gray-300 group-hover:text-emerald-400 transition-colors hidden sm:block">
              {firstName}
            </span>
          )}
          <div className="w-10 h-10 rounded-full bg-[#1F2937] border border-white/10 flex items-center justify-center group-hover:bg-[#374151] transition">
            <User size={18} className="text-[#F4B183]" />
          </div>
        </Link>
      </div>
    </header>
  );
}
