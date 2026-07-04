import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Mail, Phone, Building, Briefcase, MapPin, Calendar, Clock, ArrowLeft, Edit2, X, IndianRupee, FileText, Upload, CheckCircle } from 'lucide-react';

const EmployeeDetails = ({ user: currentUser }) => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editFiles, setEditFiles] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  
  const isAdmin = currentUser?.role === 'Admin';
  const isSelf = currentUser?.id === id;

  const calculateProfileCompletion = () => {
    if (!employee) return 0;
    const fields = [
      'phone', 'residingAddress', 'personalEmail', 'gender', 'nationality', 'maritalStatus',
      'bankName', 'accountNumber', 'ifscCode', 'panNo', 'aadharNo', 'dateOfBirth'
    ];
    let filled = 0;
    fields.forEach(f => {
      if (employee[f] && employee[f].length !== 0) filled++;
    });
    return Math.round((filled / fields.length) * 100);
  };
  const profileCompletion = calculateProfileCompletion();

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const token = localStorage.getItem('token');
        const [userRes, leavesRes] = await Promise.all([
          fetch(`http://localhost:5000/api/users/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`http://localhost:5000/api/leaves/user/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        if (!userRes.ok) throw new Error('Failed to fetch employee details');
        const data = await userRes.json();
        setEmployee(data);
        
        if (leavesRes.ok) {
          const leavesData = await leavesRes.json();
          setLeaves(leavesData);
        }
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

  const isAbsentToday = leaves.some(leave => {
    if (leave.status !== 'Approved') return false;
    const start = new Date(leave.startDate);
    start.setHours(0,0,0,0);
    const end = new Date(leave.endDate);
    end.setHours(23,59,59,999);
    const now = new Date();
    return now >= start && now <= end;
  });

  const calculatedLeavesTaken = leaves.filter(l => l.status === 'Approved').reduce((acc, leave) => {
    const days = Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
    return acc + (days > 0 ? days : 1);
  }, 0);

  let statusText = 'Unknown';
  let statusVariant = 'gray';

  if (isAbsentToday) {
    statusText = 'On Leave';
    statusVariant = 'amber';
  } else if (employee.attendances && employee.attendances.length > 0) {
    statusText = 'Present (Clocked In)';
    statusVariant = 'emerald';
  } else {
    statusText = 'Absent (Not Clocked In)';
    statusVariant = 'rose';
  }

  return (
    <div className="max-w-5xl mx-auto p-8 md:p-12 pb-10">
      {/* Top Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:shadow">
          <ArrowLeft size={16} /> Back to Directory
        </Link>
        <div className="flex gap-2">
          {isAdmin ? (
            <button 
              onClick={() => {
                setEditFormData(employee);
                setEditFiles({});
                setIsEditModalOpen(true);
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm"
            >
              <Edit2 size={16} /> Edit Profile
            </button>
          ) : isSelf ? (
            <Link 
              to="/dashboard/my-profile"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm"
            >
              <Edit2 size={16} /> Edit Profile
            </Link>
          ) : null}
          <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            {employee.status || 'Active'}
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Edit {isAdmin ? 'Employee Data' : 'Personal Profile'}</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form 
              className="p-6 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSaving(true);
                try {
                  const token = localStorage.getItem('token');
                  // Handle JSON data update
                  const res = await fetch(`http://localhost:5000/api/users/${id}`, {
                    method: 'PUT',
                    headers: { 
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(editFormData)
                  });
                  if (!res.ok) throw new Error('Failed to update details');
                  let updatedData = await res.json();
                  
                  // Handle File uploads if any
                  const hasFiles = Object.keys(editFiles).length > 0;
                  if (hasFiles) {
                    const formData = new FormData();
                    if (editFiles.aadharDoc) formData.append('aadharDoc', editFiles.aadharDoc);
                    if (editFiles.panDoc) formData.append('panDoc', editFiles.panDoc);
                    if (editFiles.voterDoc) formData.append('voterDoc', editFiles.voterDoc);
                    if (editFiles.addressProofDoc) formData.append('addressProofDoc', editFiles.addressProofDoc);
                    
                    const fileRes = await fetch(`http://localhost:5000/api/users/${id}/upload-kyc`, {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}` },
                      body: formData
                    });
                    if (!fileRes.ok) throw new Error('Failed to upload documents');
                    updatedData = await fileRes.json();
                  }

                  setEmployee(updatedData);
                  setIsEditModalOpen(false);
                } catch (err) {
                  alert(err.message);
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              {/* Admin can edit Personal Details & KYC */}
              {isAdmin && (
                <>
                  <h4 className="font-bold text-slate-800 border-b pb-2">Basic Info</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Display Name</label>
                      <input type="text" value={editFormData.displayName || ''} onChange={e => setEditFormData({...editFormData, displayName: e.target.value})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input type="tel" value={editFormData.phone || ''} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Date of Birth</label>
                      <input type="date" value={editFormData.dateOfBirth ? new Date(editFormData.dateOfBirth).toISOString().split('T')[0] : ''} onChange={e => setEditFormData({...editFormData, dateOfBirth: new Date(e.target.value).toISOString()})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Residing Address</label>
                      <input type="text" value={editFormData.residingAddress || ''} onChange={e => setEditFormData({...editFormData, residingAddress: e.target.value})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 border-b pb-2 mt-4">Personal Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Personal Email</label>
                      <input type="email" value={editFormData.personalEmail || ''} onChange={e => setEditFormData({...editFormData, personalEmail: e.target.value})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Gender</label>
                      <select value={editFormData.gender || ''} onChange={e => setEditFormData({...editFormData, gender: e.target.value})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Nationality</label>
                      <input type="text" value={editFormData.nationality || ''} onChange={e => setEditFormData({...editFormData, nationality: e.target.value})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Marital Status</label>
                      <select value={editFormData.maritalStatus || ''} onChange={e => setEditFormData({...editFormData, maritalStatus: e.target.value})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Work Location</label>
                    <input type="text" value={editFormData.location || ''} onChange={e => setEditFormData({...editFormData, location: e.target.value})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>

                  <h4 className="font-bold text-slate-800 border-b pb-2 mt-6">Banking Details</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Bank Name</label>
                      <input type="text" value={editFormData.bankName || ''} onChange={e => setEditFormData({...editFormData, bankName: e.target.value})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Account Number</label>
                      <input type="text" value={editFormData.accountNumber || ''} onChange={e => setEditFormData({...editFormData, accountNumber: e.target.value})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">IFSC Code</label>
                      <input type="text" value={editFormData.ifscCode || ''} onChange={e => setEditFormData({...editFormData, ifscCode: e.target.value})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-slate-800 border-b pb-2 mt-6">KYC Details & Documents</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Aadhar Number</label>
                      <input type="text" value={editFormData.aadharNo || ''} onChange={e => setEditFormData({...editFormData, aadharNo: e.target.value})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Aadhar Document</label>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setEditFiles({...editFiles, aadharDoc: e.target.files[0]})} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">PAN Number</label>
                      <input type="text" value={editFormData.panNo || ''} onChange={e => setEditFormData({...editFormData, panNo: e.target.value})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">PAN Document</label>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setEditFiles({...editFiles, panDoc: e.target.files[0]})} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">UAN Number</label>
                      <input type="text" value={editFormData.uanNo || ''} onChange={e => setEditFormData({...editFormData, uanNo: e.target.value})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Employee Code</label>
                      <input type="text" value={employee.employeeId || ''} readOnly className="w-full p-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-md outline-none cursor-not-allowed font-mono" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Voter ID Number</label>
                      <input type="text" value={editFormData.voterIdNo || ''} onChange={e => setEditFormData({...editFormData, voterIdNo: e.target.value})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Voter ID Document</label>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setEditFiles({...editFiles, voterDoc: e.target.files[0]})} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Address Proof Document</label>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setEditFiles({...editFiles, addressProofDoc: e.target.files[0]})} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  </div>
                </>
              )}

              {/* Admin can edit Work Details */}
              {isAdmin && (
                <>
                  <h4 className="font-bold text-slate-800 border-b pb-2 mt-6">Work Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Department</label>
                      <input type="text" value={editFormData.department || ''} onChange={e => setEditFormData({...editFormData, department: e.target.value})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Job Position</label>
                      <input type="text" value={editFormData.jobPosition || ''} onChange={e => setEditFormData({...editFormData, jobPosition: e.target.value})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Date of Joining</label>
                      <input type="date" value={editFormData.dateOfJoining ? new Date(editFormData.dateOfJoining).toISOString().split('T')[0] : ''} onChange={e => setEditFormData({...editFormData, dateOfJoining: new Date(e.target.value).toISOString()})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Working Days / Week</label>
                      <input type="number" min="1" max="7" value={editFormData.workingDaysPerWeek || 5} onChange={e => setEditFormData({...editFormData, workingDaysPerWeek: parseInt(e.target.value)})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Daily Break (Hrs)</label>
                      <input type="number" step="0.5" min="0" max="4" value={editFormData.breakTimeHrs || 1} onChange={e => setEditFormData({...editFormData, breakTimeHrs: parseFloat(e.target.value)})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Base Salary (Annual LPA)</label>
                      <div className="relative">
                        <IndianRupee size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input type="number" value={editFormData.baseSalary || 0} onChange={e => setEditFormData({...editFormData, baseSalary: parseFloat(e.target.value)})} className="w-full pl-9 p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Total Leaves Allowed</label>
                      <input type="number" value={editFormData.totalLeavesAllowed || 20} onChange={e => setEditFormData({...editFormData, totalLeavesAllowed: parseInt(e.target.value)})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSelf && (
        <div className="mb-6 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-base font-bold text-slate-800">Profile Completion</span>
            <span className="text-base font-bold text-indigo-600">{profileCompletion}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-1000 ease-out" 
              style={{ width: `${profileCompletion}%` }}
            ></div>
          </div>
          {profileCompletion < 100 && (
            <p className="text-sm text-slate-500 mt-3 font-medium">
              Your profile is incomplete. Click "Edit Profile" to finish setting up your KYC and personal details.
            </p>
          )}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header section with gradient pattern */}
        <div className="h-48 bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute top-10 left-20 w-32 h-32 bg-indigo-400 opacity-20 rounded-full blur-xl"></div>
        </div>
        
        <div className="px-8 pb-10">
          {/* Avatar and Main Info */}
          <div className="relative flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar pulled up into the banner */}
              <div className="w-32 h-32 rounded-2xl bg-white p-1.5 shadow-lg border border-slate-100 relative z-10 -mt-16">
                <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center text-4xl font-extrabold shadow-inner overflow-hidden">
                  {employee.avatar ? (
                    <img src={employee.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    (employee.displayName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  )}
                </div>
              </div>
              {/* Text positioned safely below the banner line */}
              <div className="pt-2 sm:pt-4">
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2 flex items-center gap-3">
                  {employee.displayName}
                  <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                    statusVariant === 'emerald' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                    statusVariant === 'amber' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    'bg-rose-100 text-rose-700 border-rose-200'
                  }`}>
                    {statusText}
                  </span>
                </h3>
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

                {/* We removed the old tiny salary row to replace it with the gorgeous full breakdown card below */}
              </div>
            </div>
            
            {/* Salary Breakdown Card (Gorgeous UI ported from MyProfile) */}
            {(isAdmin || isSelf) && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-xs font-extrabold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                    <span className="w-8 h-[1px] bg-slate-200"></span> Salary Structure
                  </h4>
                  {isAdmin && (
                    <button 
                      onClick={() => {
                        setEditFormData(employee);
                        setEditFiles({});
                        setIsEditModalOpen(true);
                      }}
                      className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Edit2 size={14} /> Edit Salary
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Summary Card */}
                  <div className="p-6 rounded-2xl border border-slate-200 shadow-sm bg-gradient-to-br from-indigo-900 to-slate-900 text-white relative overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
                    <h3 className="text-indigo-200 font-semibold mb-2 tracking-wide text-xs uppercase">Monthly Net Pay</h3>
                    <p className="text-4xl font-bold mb-6">₹{((employee.baseSalary || 0) - ((employee.baseSalary || 0) * 0.5 * 0.12) - ((employee.baseSalary || 0) > 21000 ? 0 : (employee.baseSalary || 0) * 0.0075) - ((employee.baseSalary || 0) > 50000 ? (employee.baseSalary || 0) * 0.1 : 0)).toLocaleString()}</p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300">Gross Monthly Wage</span>
                        <span className="font-semibold text-white">₹{(employee.baseSalary || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300">Total Deductions</span>
                        <span className="font-semibold text-rose-300">-₹{(((employee.baseSalary || 0) * 0.5 * 0.12) + ((employee.baseSalary || 0) > 21000 ? 0 : (employee.baseSalary || 0) * 0.0075) + ((employee.baseSalary || 0) > 50000 ? (employee.baseSalary || 0) * 0.1 : 0)).toLocaleString()}</span>
                      </div>
                      <div className="h-px bg-slate-700 w-full my-2"></div>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-white">Annual CTC</span>
                        <span className="text-indigo-200">₹{((employee.baseSalary || 0) * 12).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Earnings & Deductions */}
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border border-slate-200 shadow-sm bg-white">
                      <h3 className="text-sm font-bold text-slate-800 mb-4">Earnings</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50">
                          <span className="text-slate-600 font-medium text-xs">Basic Salary (50%)</span>
                          <span className="font-bold text-slate-800 text-sm">₹{((employee.baseSalary || 0) * 0.5).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50">
                          <span className="text-slate-600 font-medium text-xs">HRA (30%)</span>
                          <span className="font-bold text-slate-800 text-sm">₹{((employee.baseSalary || 0) * 0.3).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50">
                          <span className="text-slate-600 font-medium text-xs">Special Allowance (20%)</span>
                          <span className="font-bold text-slate-800 text-sm">₹{((employee.baseSalary || 0) * 0.2).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-200 shadow-sm bg-white">
                      <h3 className="text-sm font-bold text-rose-600 mb-4">Deductions</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-rose-50/50">
                          <span className="text-slate-600 font-medium text-xs">Provident Fund (12%)</span>
                          <span className="font-bold text-rose-600 text-sm">-₹{((employee.baseSalary || 0) * 0.5 * 0.12).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-rose-50/50">
                          <span className="text-slate-600 font-medium text-xs">ESI</span>
                          <span className="font-bold text-rose-600 text-sm">-₹{((employee.baseSalary || 0) > 21000 ? 0 : (employee.baseSalary || 0) * 0.0075).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-rose-50/50">
                          <span className="text-slate-600 font-medium text-xs">Tax (TDS)</span>
                          <span className="font-bold text-rose-600 text-sm">-₹{((employee.baseSalary || 0) > 50000 ? (employee.baseSalary || 0) * 0.1 : 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* KYC Details Card (Visible to Self or Admin) */}
            {(isAdmin || isSelf) && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
                <h4 className="text-xs font-extrabold tracking-widest text-slate-400 uppercase mb-5 flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-slate-200"></span> KYC & Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Aadhar Number</p>
                      <p className="text-base font-semibold text-slate-800 flex items-center gap-2">
                        {employee.aadharNo || 'Not provided'} 
                        {employee.aadharDoc && <a href={`http://localhost:5000${employee.aadharDoc}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-xs bg-indigo-50 px-2 py-1 rounded">View Doc</a>}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">PAN Number</p>
                      <p className="text-base font-semibold text-slate-800 flex items-center gap-2">
                        {employee.panNo || 'Not provided'}
                        {employee.panDoc && <a href={`http://localhost:5000${employee.panDoc}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-xs bg-indigo-50 px-2 py-1 rounded">View Doc</a>}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Voter ID</p>
                      <p className="text-base font-semibold text-slate-800 flex items-center gap-2">
                        {employee.voterIdNo || 'Not provided'}
                        {employee.voterDoc && <a href={`http://localhost:5000${employee.voterDoc}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-xs bg-indigo-50 px-2 py-1 rounded">View Doc</a>}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Address Proof</p>
                      <p className="text-base font-semibold text-slate-800 flex items-center gap-2">
                        {employee.addressProofDoc ? <a href={`http://localhost:5000${employee.addressProofDoc}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-xs bg-indigo-50 px-2 py-1 rounded">View Address Proof</a> : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Time Off & Attendance Card */}
            {(isAdmin || isSelf) && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
                <h4 className="text-xs font-extrabold tracking-widest text-slate-400 uppercase mb-5 flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-slate-200"></span> Attendance & Time Off
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase">Total Allowance</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">{employee.totalLeavesAllowed || 20}</p>
                  </div>
                  <div className="bg-rose-50 rounded-lg p-4 border border-rose-200 text-center">
                    <p className="text-xs font-bold text-rose-500 uppercase">Leaves Taken</p>
                    <p className="text-2xl font-black text-rose-700 mt-1">{calculatedLeavesTaken}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 text-center">
                    <p className="text-xs font-bold text-emerald-600 uppercase">Remaining Balance</p>
                    <p className="text-2xl font-black text-emerald-700 mt-1">{(employee.totalLeavesAllowed || 20) - calculatedLeavesTaken}</p>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-bold text-slate-700 mb-3">Leave History</h5>
                  {leaves.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No leave records found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase">
                            <th className="py-2 px-4">Type</th>
                            <th className="py-2 px-4">Dates</th>
                            <th className="py-2 px-4">Status</th>
                            <th className="py-2 px-4">Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaves.map(leave => (
                            <tr key={leave.id} className="border-b border-slate-100 text-sm">
                              <td className="py-2 px-4 font-semibold text-slate-700">{leave.type}</td>
                              <td className="py-2 px-4 text-slate-600">
                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                              </td>
                              <td className="py-2 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                                  leave.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {leave.status}
                                </span>
                              </td>
                              <td className="py-2 px-4 text-slate-500 truncate max-w-[200px]" title={leave.reason}>{leave.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
