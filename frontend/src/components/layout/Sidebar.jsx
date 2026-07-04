import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, CalendarDays, Wallet, UserPlus, Clock, Building, ShieldCheck, Mail, ChevronLeft, Bell, Settings, LogOut, User } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

const Sidebar = ({ user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    navigate('/login');
  };

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm font-semibold ${
      isActive
        ? 'bg-white text-accent-primary shadow-sm scale-[1.02]'
        : 'text-text-secondary hover:bg-white/50 hover:text-text-primary'
    } ${isCollapsed ? 'justify-center' : 'px-4'}`;
  };

  return (
    <div className={`flex flex-col h-full bg-transparent p-2 relative transition-[width] duration-300 ${isCollapsed ? 'w-[80px]' : 'w-[240px]'}`}>
      {/* Company Logo area */}
      <div className={`flex items-center gap-3 py-4 mb-4 ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
        <div className="w-10 h-10 shrink-0 rounded-xl bg-accent-primary text-white flex items-center justify-center shadow-md">
          <Building size={20} />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col whitespace-nowrap overflow-hidden">
            <span className="text-lg font-bold text-text-primary tracking-tight">
              {user?.companyName || 'Crew HR'}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">
              Workspace
            </span>
          </div>
        )}
      </div>
      
      <nav className={`flex flex-col gap-2 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar ${isCollapsed ? 'px-0' : 'px-2'}`}>
        <Link to="/dashboard" className={getLinkClass('/dashboard')} title="Employees">
          <Users size={20} className="shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Employees</span>}
        </Link>

        <Link to="/dashboard/attendance" className={getLinkClass('/dashboard/attendance')} title="Attendance">
          <Clock size={20} className="shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Attendance</span>}
        </Link>

        <Link to="/dashboard/time-off" className={getLinkClass('/dashboard/time-off')} title="Time Off">
          <CalendarDays size={20} className="shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Time Off</span>}
        </Link>

        {isAdmin && (
          <>
            {!isCollapsed ? (
              <div className="mt-6 mb-2 px-4 whitespace-nowrap">
                <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Admin</span>
              </div>
            ) : (
              <div className="mt-6 mb-2 w-full h-px bg-border-subtle" />
            )}
            
            <Link to="/dashboard/add-employee" className={getLinkClass('/dashboard/add-employee')} title="Add Employee">
              <UserPlus size={20} className="shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">Add Employee</span>}
            </Link>
            <Link to="/dashboard/payroll" className={getLinkClass('/dashboard/payroll')} title="Payroll">
              <Wallet size={20} className="shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">Payroll</span>}
            </Link>
            <Link to="/dashboard/invite-employee" className={getLinkClass('/dashboard/invite-employee')} title="Invite Employees">
              <Mail size={20} className="shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">Invite Employees</span>}
            </Link>
            <Link to="/dashboard/manage-admins" className={getLinkClass('/dashboard/manage-admins')} title="Manage Admins">
              <ShieldCheck size={20} className="shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">Manage Admins</span>}
            </Link>
          </>
        )}
      </nav>

      {/* Collapse button floating halfway out */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-text-primary text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all z-50"
      >
        <ChevronLeft size={14} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Bottom Actions */}
      <div className={`flex items-center gap-4 pt-6 pb-2 mt-auto transition-all relative ${isCollapsed ? 'flex-col justify-center px-0' : 'flex-row justify-start px-4'}`}>
        {!isCollapsed && (
          <>
            <button className="text-text-secondary hover:text-text-primary transition-colors">
              <Bell size={20} />
            </button>
            <button className="text-text-secondary hover:text-text-primary transition-colors">
              <Settings size={20} />
            </button>
          </>
        )}
        <div className={`relative ${isCollapsed ? 'mx-auto' : ''}`} ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="hover:ring-2 hover:ring-accent-primary rounded-full transition-all focus:outline-none"
          >
            <Avatar size="sm" initials={initials} className="bg-text-primary text-white" />
          </button>
          
          {dropdownOpen && (
            <div className={`absolute bottom-full mb-2 bg-white rounded-xl shadow-lg border border-border-default py-1 z-50 w-48 ${isCollapsed ? 'left-0' : 'left-0'}`}>
              <Link
                to="/dashboard/my-profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-card hover:text-text-primary transition-colors"
              >
                <User size={16} />
                My Profile
              </Link>
              <div className="border-t border-border-subtle my-1"></div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 w-full transition-colors"
              >
                <LogOut size={16} />
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
