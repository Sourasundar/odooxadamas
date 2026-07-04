import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { format } from 'date-fns';

const LeaveApprovals = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllLeaves = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/leave/all`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch leaves:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLeaves();
  }, []);

  const handleStatusChange = async (id, status) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/leave/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) fetchAllLeaves();
    } catch (err) {
      console.error(err);
      fetchAllLeaves();
    }
  };

  const pendingLeaves = leaves.filter(l => l.status === 'Pending');

  return (
    <div className="p-8 md:p-12 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#1a1a2e] font-serif tracking-tight">Leave Approvals</h1>
        <p className="text-slate-500 mt-2">Manage and review pending time off requests from your employees.</p>
      </div>

      <Card className="p-6 shadow-sm border-slate-100 flex-1 overflow-hidden flex flex-col">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-900 shrink-0">
          Pending Applications ({pendingLeaves.length})
        </h3>
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-sm font-bold text-slate-400">Employee</th>
                <th className="pb-3 text-sm font-bold text-slate-400">Dates</th>
                <th className="pb-3 text-sm font-bold text-slate-400">Reason</th>
                <th className="pb-3 text-sm font-bold text-slate-400">Doc</th>
                <th className="pb-3 text-sm font-bold text-slate-400 text-center">Status</th>
                <th className="pb-3 text-sm font-bold text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="py-8 text-center text-slate-500">Loading...</td></tr>
              ) : pendingLeaves.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-slate-500">No pending leave requests right now! 🎉</td></tr>
              ) : (
                pendingLeaves.map(leave => (
                  <tr key={leave.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 font-semibold text-slate-800">
                      {leave.user?.displayName || 'Unknown'} <br/>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{leave.user?.department}</span>
                    </td>
                    <td className="py-4 text-sm font-medium text-slate-600">
                      {format(new Date(leave.startDate), 'MMM d, yyyy')} <br/>to<br/> {format(new Date(leave.endDate), 'MMM d, yyyy')}
                    </td>
                    <td className="py-4 text-sm text-slate-600 max-w-[200px]">
                      <div className="truncate" title={leave.reason}>{leave.reason}</div>
                    </td>
                    <td className="py-4">
                      {leave.attachment ? (
                        <a href={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${leave.attachment}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap">
                          View Proof
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-4 text-center">
                      <span className="font-bold px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200">
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2 whitespace-nowrap">
                      <button 
                        onClick={() => handleStatusChange(leave.id, 'Approved')}
                        className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors border border-emerald-200 shadow-sm"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleStatusChange(leave.id, 'Rejected')}
                        className="text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors border border-red-200 shadow-sm"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default LeaveApprovals;

