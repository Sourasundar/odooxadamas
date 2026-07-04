import React from 'react';
import Sidebar from './Sidebar';

const ShellLayout = ({ user, children }) => {
  return (
    <div className="flex h-screen w-screen bg-bg-base overflow-hidden p-4 gap-4">
      <Sidebar user={user} />
      <main className="flex-1 bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] bg-grid-pattern overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
};

export default ShellLayout;
