import { createContext, useState } from "react";
import Sidebar from "./Sidebar";
import LoadingOverlay from "../components/LoadingOverlay";

export const SidebarContext = createContext({ toggleSidebar: () => {} });

export default function MainLayout({ children, isLoading = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth >= 1024,
  );

  const toggleSidebar = () => setSidebarOpen((p) => !p);

  return (
    <SidebarContext.Provider value={{ toggleSidebar }}>
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
          <div className="p-4 lg:p-10 relative">
            {isLoading && <LoadingOverlay />}
            {children}
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
