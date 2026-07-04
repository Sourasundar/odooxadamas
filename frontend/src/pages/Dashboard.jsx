import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, CalendarDays, Wallet, LogOut, UserPlus, Clock, Building, User, ChevronDown, ShieldCheck, Mail } from 'lucide-react';
import CreateEmployee from './admin/CreateEmployee';
import ManageAdmins from './admin/ManageAdmins';
import InviteEmployee from './admin/InviteEmployee';
import EmployeeDetails from './admin/EmployeeDetails';

// ── Sidebar ──────────────────────────────────────────────

const Sidebar = ({ user }) => {
  const location = useLocation();
  const isAdmin = user?.role === 'Admin';

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
      isActive
        ? 'bg-primary-600 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;
  };

  return (
    <div className="w-60 h-screen bg-white border-r border-slate-200 fixed left-0 top-0 p-4 flex flex-col z-10">
      {/* Company Logo area */}
      <div className="flex items-center gap-2.5 px-3 py-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center">
          <Building size={18} />
        </div>
        <span className="text-lg font-bold text-slate-800 tracking-tight">
          {user?.companyName || 'AcmeHR'}
        </span>
      </div>
      
      <nav className="flex flex-col gap-1 flex-1">
        <Link to="/dashboard" className={getLinkClass('/dashboard')}>
          <Users size={18} />
          Employees
        </Link>

        <Link to="/dashboard/attendance" className={getLinkClass('/dashboard/attendance')}>
          <Clock size={18} />
          Attendance
        </Link>

        <Link to="/dashboard/time-off" className={getLinkClass('/dashboard/time-off')}>
          <CalendarDays size={18} />
          Time Off
        </Link>

        {isAdmin && (
          <>
            <div className="mt-4 mb-2 px-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</span>
            </div>
            <Link to="/dashboard/add-employee" className={getLinkClass('/dashboard/add-employee')}>
              <UserPlus size={18} />
              Add Employee
            </Link>
            <Link to="/dashboard/payroll" className={getLinkClass('/dashboard/payroll')}>
              <Wallet size={18} />
              Payroll
            </Link>
            <Link to="/dashboard/invite-employee" className={getLinkClass('/dashboard/invite-employee')}>
              <Mail size={18} />
              Invite Employees
            </Link>
            <Link to="/dashboard/manage-admins" className={getLinkClass('/dashboard/manage-admins')}>
              <ShieldCheck size={18} />
              Manage Admins
            </Link>
          </>
        )}
      </nav>
    </div>
  );
};

// ── Top Bar with Avatar Dropdown ─────────────────────────

const TopBar = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  return (
    <header className="mb-6 flex justify-between items-center bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm">
      <div></div>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 rounded-lg px-2 py-1 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary-50 border border-primary-200 flex items-center justify-center font-semibold text-primary-700 text-xs">
            {initials}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-medium text-slate-700 leading-none">{user?.displayName || 'User'}</span>
            <span className="text-xs text-slate-400 mt-0.5">{user?.role}</span>
          </div>
          <ChevronDown size={14} className="text-slate-400" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
            <Link
              to="/dashboard/my-profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <User size={16} />
              My Profile
            </Link>
            <div className="border-t border-slate-100 my-1"></div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

// ── Employee Cards View (Landing page after login) ───────

const EmployeeCards = ({ user }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEmployees(data);
        }
      } catch (err) {
        console.error('Failed to fetch employees:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchEmployees();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const getStatusDot = (status) => {
    switch (status) {
      case 'Active': return <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" title="Present"></span>;
      case 'OnLeave': return <span className="text-sm" title="On Leave">✈️</span>;
      case 'Inactive': return <span className="w-3 h-3 rounded-full bg-amber-400 border-2 border-white shadow-sm" title="Absent"></span>;
      default: return <span className="w-3 h-3 rounded-full bg-slate-300 border-2 border-white shadow-sm"></span>;
    }
  };

  const filteredEmployees = employees.filter(emp =>
    (emp.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.department || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <Users size={40} className="mx-auto text-slate-300 mb-3" />
        <h3 className="text-lg font-semibold text-slate-700">Welcome, {user.displayName}</h3>
        <p className="text-slate-500 text-sm mt-1">Use the sidebar to navigate to your Attendance, Time Off, or Profile.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-slate-800">Employees</h2>
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm placeholder-slate-400"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading employees...</div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <p className="text-slate-500">No employees found. Add your first employee from the sidebar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => (
            <Link
              key={emp.id}
              to={`/dashboard/employee/${emp.id}`}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group relative"
            >
              <div className="absolute top-4 right-4">
                {getStatusDot(emp.status)}
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center font-bold text-primary-700 text-sm flex-shrink-0">
                  {(emp.displayName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-primary-600 transition-colors">{emp.displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{emp.department || 'No department'}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{emp.employeeId}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// ── My Profile placeholder ───────────────────────────────

const MyProfile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">My Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><span className="text-sm text-slate-500">Name</span><p className="font-medium text-slate-800">{user.displayName || '-'}</p></div>
        <div><span className="text-sm text-slate-500">Employee ID</span><p className="font-medium text-slate-800 font-mono">{user.employeeId || '-'}</p></div>
        <div><span className="text-sm text-slate-500">Email</span><p className="font-medium text-slate-800">{user.email || '-'}</p></div>
        <div><span className="text-sm text-slate-500">Phone</span><p className="font-medium text-slate-800">{user.phone || '-'}</p></div>
        <div><span className="text-sm text-slate-500">Role</span><p className="font-medium text-slate-800">{user.role || '-'}</p></div>
        <div><span className="text-sm text-slate-500">Department</span><p className="font-medium text-slate-800">{user.department || '-'}</p></div>
      </div>
    </div>
  );
};

// ── Main Dashboard Layout ────────────────────────────────

const Dashboard = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const fetchedUser = await res.json();
          localStorage.setItem('user', JSON.stringify(fetchedUser));
          setUser(fetchedUser); // Re-render with new role!
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMe();
  }, []);

  return (
    <div className="flex pl-60 min-h-screen bg-slate-50">
      <Sidebar user={user} />
      <main className="flex-1 px-6 py-5 max-w-6xl">
        <TopBar user={user} />
        <Routes>
          <Route path="/" element={<EmployeeCards user={user} />} />
          <Route path="/employee/:id" element={<EmployeeDetails />} />
          <Route path="/add-employee" element={<CreateEmployee />} />
          <Route path="/invite-employee" element={<InviteEmployee />} />
          <Route path="/manage-admins" element={<ManageAdmins />} />
          <Route path="/my-profile" element={<MyProfile />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
