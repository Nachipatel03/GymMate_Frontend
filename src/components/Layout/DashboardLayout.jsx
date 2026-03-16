import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
  role = 'admin',
  currentPage = 'Dashboard',
  title = 'Dashboard'
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
  <>
      {/* 🔔 GLOBAL TOASTER */}
      <Toaster
        richColors
        position="top-right"
        expand
        closeButton
        duration={2000}  
      />

      <div className="min-h-screen bg-slate-950 flex">
        {/* Background Gradient Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        {/* Desktop Sidebar */}
        <Sidebar
          role={role}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          currentPage={currentPage}
          isMobile={false}
        />

        {/* Mobile Sidebar */}
        <Sidebar
          role={role}
          isOpen={mobileSidebarOpen}
          onToggle={() => setMobileSidebarOpen(false)}
          currentPage={currentPage}
          isMobile={true}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen relative z-10">
          <Navbar
            onMenuClick={() => setMobileSidebarOpen(true)}
            title={title}
          />
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
        </>
      );
}