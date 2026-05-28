import React from "react";
import { Link } from "react-router-dom";
import { Bell, Search, User } from "lucide-react";

export default function Header({ title, rightSection, breadcrumbs }) {
  return (
    <header className="bg-[#191C1E] border-b border-white/5 flex items-center justify-between px-1 py-4 min-h-20">
      {/* TITLE + BREADCRUMB */}
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

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-5">
        {rightSection ? (
          rightSection
        ) : (
          <>
            {/* NOTIFICATION */}
            <Link
              to="/notifications"
              className="text-gray-400 hover:text-white transition"
            >
              <Bell size={18} />
            </Link>

            {/* SEARCH */}
            <Link
              to="/search"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:bg-white/20 transition"
            >
              <Search size={18} />
            </Link>

            {/* DIVIDER */}
            <div className="h-8 w-px bg-white/10"></div>

            {/* PROFILE */}
            <Link
              to="/profile"
              className="w-10 h-10 rounded-full bg-[#1F2937] border border-white/10 flex items-center justify-center hover:bg-[#374151] transition cursor-pointer"
            >
              <User size={18} className="text-[#F4B183]" />
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
