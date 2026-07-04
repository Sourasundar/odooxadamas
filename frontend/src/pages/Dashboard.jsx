import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Users, Plus, Cpu, FileText, FlaskConical } from 'lucide-react';
import CreateEmployee from './admin/CreateEmployee';
import ManageAdmins from './admin/ManageAdmins';
import InviteEmployee from './admin/InviteEmployee';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import ShellLayout from '../components/layout/ShellLayout';
import EmployeeDetails from './admin/EmployeeDetails';

// ── Employee Cards View (Marketplace-style grid) ───────

const EmployeeCards = ({ user }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const isAdmin = user?.role === 'Admin';
  const navigate = useNavigate();

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

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = (emp.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (emp.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (emp.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Simulate tabs filtering logic
    if (activeTab === 'active') return matchesSearch && emp.status !== 'Inactive';
    if (activeTab === 'inactive') return matchesSearch && emp.status === 'Inactive';
    return matchesSearch;
  });

  if (!isAdmin) {
    return (
      <div className="p-12 text-center max-w-md mx-auto">
        <Users size={48} className="mx-auto text-slate-300 mb-6" />
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Welcome, {user.displayName}</h3>
        <p className="text-slate-500">Use the sidebar to navigate to your Attendance, Time Off, or Profile.</p>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 relative h-full flex flex-col">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold text-[#1a1a2e] font-serif tracking-tight">Employees</h1>
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Input
              type="text"
              placeholder="Search directory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-full bg-slate-50 border-slate-200"
            />
          </div>
          <Button variant="primary" onClick={() => navigate('/dashboard/add-employee')} className="rounded-full gap-2">
            <Plus size={18} /> New Listing
          </Button>
        </div>
      </div>

      {/* Segmented Toggle */}
      <div className="flex justify-center mb-10">
        <SegmentedControl 
          options={[
            { label: 'Active Staff', value: 'active' },
            { label: 'Inactive / Past', value: 'inactive' }
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Card Grid */}
      <div className="flex-1 overflow-y-auto pb-8 custom-scrollbar">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <Card key={i} className="h-48 animate-pulse" />
            ))}
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">No employees found in this view.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((emp) => {
              // Map some random icons for the "Marketplace" aesthetic based on department
              let deptIcon = <FileText size={18} />;
              let deptColor = "text-purple-500";
              let deptBg = "bg-purple-50";
              
              if (emp.department?.toLowerCase().includes('eng') || emp.department?.toLowerCase().includes('dev')) {
                deptIcon = <Cpu size={18} />;
                deptColor = "text-blue-500";
                deptBg = "bg-blue-50";
              } else if (emp.department?.toLowerCase().includes('lab') || emp.department?.toLowerCase().includes('science')) {
                deptIcon = <FlaskConical size={18} />;
                deptColor = "text-green-500";
                deptBg = "bg-green-50";
              }

              // Map status to badge colors
              let statusVariant = 'gray';
              let statusText = emp.status || 'UNKNOWN';
              if (emp.status === 'Active') {
                statusVariant = 'blue';
                statusText = 'Full Time';
              } else if (emp.status === 'Inactive') {
                statusVariant = 'red';
                statusText = 'Offboarded';
              }

              return (
                <Link
                  key={emp.id}
                  to={`/dashboard/employee/${emp.id}`}
                  className="block group"
                >
                  <Card className="p-6 flex flex-col h-full hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      {/* Category icon + label */}
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${deptBg} ${deptColor} flex items-center justify-center`}>
                          {deptIcon}
                        </div>
                        <span className="font-semibold text-slate-700 text-sm">{emp.department || 'General'}</span>
                      </div>
                      
                      {/* Status Badge */}
                      <Badge variant={statusVariant}>{statusText}</Badge>
                    </div>

                    <h3 className="text-xl font-bold text-[#1a1a2e] mb-1 group-hover:text-accent-primary transition-colors">
                      {emp.displayName}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">ID: {emp.employeeId}</p>
                    
                    <div className="h-px bg-slate-100 w-full my-4"></div>
                    
                    <span className="text-sm text-slate-400 group-hover:text-accent-primary group-hover:underline decoration-accent-primary/30 underline-offset-4 transition-all">
                      View details →
                    </span>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ── My Profile placeholder ───────────────────────────────

const MyProfile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    <div className="p-8 md:p-12">
      <h1 className="text-4xl font-bold text-[#1a1a2e] font-serif tracking-tight mb-8">My Profile</h1>
      <Card className="p-8 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><span className="text-sm text-slate-400 block mb-1">Name</span><p className="font-semibold text-slate-800">{user.displayName || '-'}</p></div>
          <div><span className="text-sm text-slate-400 block mb-1">Employee ID</span><p className="font-semibold text-slate-800 font-mono">{user.employeeId || '-'}</p></div>
          <div><span className="text-sm text-slate-400 block mb-1">Email</span><p className="font-semibold text-slate-800">{user.email || '-'}</p></div>
          <div><span className="text-sm text-slate-400 block mb-1">Phone</span><p className="font-semibold text-slate-800">{user.phone || '-'}</p></div>
          <div><span className="text-sm text-slate-400 block mb-1">Role</span><p className="font-semibold text-slate-800">{user.role || '-'}</p></div>
          <div><span className="text-sm text-slate-400 block mb-1">Department</span><p className="font-semibold text-slate-800">{user.department || '-'}</p></div>
        </div>
      </Card>
    </div>
  );
};

// ── Main Dashboard Layout Wrapper ────────────────────────

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
          setUser(fetchedUser); 
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMe();
  }, []);

  return (
    <ShellLayout user={user}>
      <Routes>
        <Route path="/" element={<EmployeeCards user={user} />} />
        <Route path="/employee/:id" element={<div className="p-8 md:p-12"><EmployeeDetails /></div>} />
        <Route path="/add-employee" element={<div className="p-8 md:p-12"><CreateEmployee /></div>} />
        <Route path="/invite-employee" element={<div className="p-8 md:p-12"><InviteEmployee /></div>} />
        <Route path="/manage-admins" element={<div className="p-8 md:p-12"><ManageAdmins /></div>} />
        <Route path="/my-profile" element={<MyProfile />} />
      </Routes>
    </ShellLayout>
  );
};

export default Dashboard;
