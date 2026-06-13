import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "../components/Header";
import LoadingOverlay from "../components/LoadingOverlay";
import { SidebarContext } from "../context/SidebarContext";

export default function MainLayout({
  children,
  isLoading = false,
  title,
  breadcrumbs,
  rightSection,
}) {
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
          <Header title={title} breadcrumbs={breadcrumbs} rightSection={rightSection} />
          <div className="p-4 lg:p-10 relative">
            {isLoading && <LoadingOverlay />}
            {children}
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
