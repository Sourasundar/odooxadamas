import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, CalendarDays, Wallet, UserPlus, Clock, ShieldCheck, Mail, Bell, Settings, LogOut, User, LayoutDashboard } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

const Sidebar = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'Admin';

  const initials = (user?.displayName || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl transition-all text-sm font-semibold ${
      isActive
        ? 'bg-white text-accent-primary shadow-sm scale-[1.02]'
        : 'text-text-secondary hover:bg-white/50 hover:text-text-primary'
    }`;
  };

  return (
    <div className="flex flex-col h-full bg-transparent p-2 w-[160px] relative">
      {/* Company Logo area */}
      <div className="flex items-center justify-center pt-0 pb-4 px-4 mb-0 w-full">
        <img src="/Crew.png" alt="Crew HR Logo" className="w-full h-auto object-contain drop-shadow-sm" />
      </div>
      
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-1">
        <Link to="/dashboard" className={getLinkClass('/dashboard')} title={isAdmin ? "Employees" : "Dashboard"}>
          {isAdmin ? <Users size={18} className="shrink-0" /> : <LayoutDashboard size={18} className="shrink-0" />}
          <span className="whitespace-nowrap">{isAdmin ? "Employees" : "Dashboard"}</span>
        </Link>

        <Link to="/dashboard/attendance" className={getLinkClass('/dashboard/attendance')} title="Attendance">
          <Clock size={18} className="shrink-0" />
          <span className="whitespace-nowrap">Attendance</span>
        </Link>

        <Link to="/dashboard/time-off" className={getLinkClass('/dashboard/time-off')} title="Time Off">
          <CalendarDays size={18} className="shrink-0" />
          <span className="whitespace-nowrap">Time Off</span>
        </Link>

        {isAdmin && (
          <>
            <div className="mt-4 mb-2 px-2 whitespace-nowrap">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                Admin
              </span>
            </div>
            
            <Link to="/dashboard/add-employee" className={getLinkClass('/dashboard/add-employee')} title="Add Employee">
               <UserPlus size={18} className="shrink-0" />
               <span className="whitespace-nowrap truncate">Add Employee</span>
            </Link>
            <Link to="/dashboard/payroll" className={getLinkClass('/dashboard/payroll')} title="Payroll">
               <Wallet size={18} className="shrink-0" />
               <span className="whitespace-nowrap truncate">Payroll</span>
            </Link>
            <Link to="/dashboard/leave-approvals" className={getLinkClass('/dashboard/leave-approvals')} title="Leave Approvals">
               <CalendarDays size={18} className="shrink-0" />
               <span className="whitespace-nowrap truncate">Leave Approvals</span>
            </Link>
            <Link to="/dashboard/invite-employee" className={getLinkClass('/dashboard/invite-employee')} title="Invite Employees">
               <Mail size={18} className="shrink-0" />
               <span className="whitespace-nowrap truncate">Invite Employ..</span>
            </Link>
            <Link to="/dashboard/manage-admins" className={getLinkClass('/dashboard/manage-admins')} title="Manage Admins">
               <ShieldCheck size={18} className="shrink-0" />
               <span className="whitespace-nowrap truncate">Manage Admins</span>
            </Link>
          </>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="flex items-center gap-3 pt-6 pb-2 mt-auto justify-start px-2">
        <button className="text-text-secondary hover:text-text-primary transition-colors">
          <Bell size={18} />
        </button>
        <button className="text-text-secondary hover:text-text-primary transition-colors">
          <Settings size={18} />
        </button>
        
        <div className="relative ml-auto" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="hover:ring-2 hover:ring-accent-primary rounded-full transition-all focus:outline-none"
          >
            <Avatar size="sm" src={user?.avatar} initials={initials} className="bg-text-primary text-white w-8 h-8 text-[12px]" />
          </button>
          
          {dropdownOpen && (
            <div className="absolute bottom-full mb-2 bg-white rounded-xl shadow-lg border border-border-default py-1 z-50 w-48 left-0">
              <Link
                to="/dashboard/my-profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-card hover:text-text-primary transition-colors"
              >
                <User size={18} />
                My Profile
              </Link>
              <div className="border-t border-border-subtle my-1"></div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 w-full transition-colors"
              >
                <LogOut size={18} />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
