import { useState } from "react";
import Sidebar from "./Sidebar";
import LoadingOverlay from "../components/LoadingOverlay";
import Header from "../components/Header";
import { Menu } from "lucide-react";

export default function MainLayout({ children, isLoading = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);

  return (
    <div className="flex h-screen overflow-hidden bg-[#191C1E] text-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 overflow-y-auto relative">
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-[#191C1E] border-b border-gray-800 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="text-emerald-500 font-bold text-lg lg:hidden">WealthWise</span>
        </div>

        <div className="p-4 lg:p-10 relative">
          {isLoading && <LoadingOverlay />}
          {children}
        </div>
      </main>
    </div>
  );
}
