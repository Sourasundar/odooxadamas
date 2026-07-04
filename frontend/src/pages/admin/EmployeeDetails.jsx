import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Mail, Phone, Building, Briefcase, MapPin, Calendar, Clock, ArrowLeft } from 'lucide-react';

const EmployeeDetails = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/users/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch employee details');
        const data = await res.json();
        setEmployee(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!employee) return <div className="p-8 text-center text-slate-500">Employee not found</div>;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Top Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:shadow">
          <ArrowLeft size={16} /> Back to Directory
        </Link>
        <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
          {employee.status || 'Active'}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header section with gradient pattern */}
        <div className="h-48 bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute top-10 left-20 w-32 h-32 bg-primary-400 opacity-20 rounded-full blur-xl"></div>
        </div>
        
        <div className="px-8 pb-10">
          {/* Avatar and Main Info */}
          <div className="relative flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar pulled up into the banner */}
              <div className="w-32 h-32 rounded-2xl bg-white p-1.5 shadow-lg border border-slate-100 relative z-10 -mt-16">
                <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 text-primary-700 rounded-xl flex items-center justify-center text-4xl font-extrabold shadow-inner">
                  {(employee.displayName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              </div>
              {/* Text positioned safely below the banner line */}
              <div className="pt-2 sm:pt-4">
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{employee.displayName}</h3>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                    <Briefcase size={14} className="text-slate-400" />
                    {employee.jobPosition || 'Employee'}
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                    <Building size={14} className="text-slate-400" />
                    {employee.department || 'No Department'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="sm:pt-4 w-full sm:w-auto">
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Employee ID</p>
                  <p className="text-sm font-mono font-bold text-slate-700">{employee.employeeId}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Contact Information Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xs font-extrabold tracking-widest text-slate-400 uppercase mb-5 flex items-center gap-2">
                <span className="w-8 h-[1px] bg-slate-200"></span> Contact Info
              </h4>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Email Address</p>
                    <p className="text-base font-semibold text-slate-800">{employee.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Phone Number</p>
                    <p className="text-base font-semibold text-slate-800">{employee.phone || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Location</p>
                    <p className="text-base font-semibold text-slate-800">{employee.location || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Employment Details Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xs font-extrabold tracking-widest text-slate-400 uppercase mb-5 flex items-center gap-2">
                <span className="w-8 h-[1px] bg-slate-200"></span> Employment Details
              </h4>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Building size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Department</p>
                    <p className="text-base font-semibold text-slate-800">{employee.department || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Date of Joining</p>
                    <p className="text-base font-semibold text-slate-800">
                      {employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Work Schedule</p>
                    <p className="text-base font-semibold text-slate-800">
                      {employee.workingDaysPerWeek ? `${employee.workingDaysPerWeek} Days/Week` : 'Not provided'} 
                      {employee.breakTimeHrs ? ` • ${employee.breakTimeHrs}h Daily Break` : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
