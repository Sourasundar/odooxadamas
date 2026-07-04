import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

const ShellLayout = ({ user, children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-bg-base overflow-hidden p-0 md:p-4 gap-0 md:gap-4 relative">
      
      {/* Mobile Toggle Button */}
      <button 
        className="md:hidden absolute top-5 left-5 z-50 p-2 bg-white/80 backdrop-blur rounded-lg shadow-sm text-slate-700 border border-slate-200/50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        bg-bg-base md:bg-transparent shadow-xl md:shadow-none p-4 md:p-0 h-full w-[240px] md:w-auto
      `}>
        <Sidebar user={user} onCloseMobile={() => setIsMobileOpen(false)} />
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 rounded-none md:rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] bg-mesh-pattern overflow-y-auto relative w-full">
        {/* Safe padding on mobile for the absolute menu button so content doesn't get obscured */}
        <div className="md:hidden h-14 w-full" />
        {children}
      </main>
    </div>
  );
};

export default ShellLayout;
