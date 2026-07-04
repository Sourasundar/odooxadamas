import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FileText, IndianRupee, Download, PlusCircle } from 'lucide-react';

const Payroll = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [payrolls, setPayrolls] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Advance form state
  const [advanceAmt, setAdvanceAmt] = useState('');
  const [advanceReason, setAdvanceReason] = useState('');
  const [advanceMonth, setAdvanceMonth] = useState('2026-07');
  
  const isAdmin = user?.role === 'Admin';
  const [genMonth, setGenMonth] = useState('2026-07');

  const fetchPayrolls = async () => {
    try {
      const url = isAdmin ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payroll/all` : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payroll/me`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setPayrolls(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const fetchAdvances = async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payroll/advances`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setAdvances(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchPayrolls();
    fetchAdvances();
  }, [isAdmin]);

  const handleRequestAdvance = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payroll/advance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: parseFloat(advanceAmt), reason: advanceReason, monthDeduction: advanceMonth })
      });
      if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        throw new Error(data.error || 'Failed to request advance');
      }
      setSuccessMsg('Advance requested successfully!');
      setAdvanceAmt('');
      setAdvanceReason('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async (id, status) => {
    setErrorMsg('');
    setSuccessMsg('');
    
    // Optimistic UI Update for instant feedback
    setAdvances(prev => prev.map(a => a.id === id ? { ...a, status } : a));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payroll/advance/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        throw new Error(data.error || 'Failed to update status');
      }
      fetchAdvances();
      setSuccessMsg(`Advance ${status.toLowerCase()} successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const handleGeneratePayroll = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payroll/generate/${genMonth}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate payroll');
      setSuccessMsg(`Payroll generated for ${data.count} employees!`);
      fetchPayrolls();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">Payroll & Compensation</h1>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 flex items-start gap-2">
          <span className="font-semibold">Error:</span> {errorMsg}
        </div>
      )}
      
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-600 text-sm rounded-lg border border-emerald-200 flex items-start gap-2">
          <span className="font-semibold">Success:</span> {successMsg}
        </div>
      )}

      {isAdmin && (
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-indigo-100/50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-indigo-900 mb-1">Generate Monthly Payroll</h2>
              <p className="text-slate-500 text-sm mb-4">Automatically calculates based on Base Salary, active attendance, and approved advances.</p>
            </div>
            <div className="flex gap-4 items-center">
              <Input type="month" value={genMonth} onChange={(e) => setGenMonth(e.target.value)} className="w-48 bg-white" />
              <Button onClick={handleGeneratePayroll} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white whitespace-nowrap">
                {loading ? 'Processing...' : 'Run Payroll Engine'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Salary Advance Request (Employee) */}
        {!isAdmin && (
          <Card className="p-6 col-span-1">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <IndianRupee size={20} className="text-emerald-500" /> Request Advance
            </h3>
            <p className="text-xs text-slate-500 mb-4">Advances will be automatically deducted from your selected month's payslip.</p>
            <form onSubmit={handleRequestAdvance} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Amount (₹)</label>
                <input type="number" required value={advanceAmt} onChange={e => setAdvanceAmt(e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Deduction Month</label>
                <input type="month" required value={advanceMonth} onChange={e => setAdvanceMonth(e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Reason</label>
                <input type="text" required value={advanceReason} onChange={e => setAdvanceReason(e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                Submit Request
              </Button>
            </form>
          </Card>
        )}

        {/* Salary Advances Approval (Admin) */}
        {isAdmin && (
          <Card className="p-6 col-span-1">
            <h3 className="text-xl font-bold mb-4">Pending Advances</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {advances.filter(a => a.status === 'Pending').length === 0 ? <p className="text-slate-500">No pending advances.</p> : null}
              {advances.filter(a => a.status === 'Pending').map(adv => (
                <div key={adv.id} className="border border-slate-100 p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-slate-800">{adv.user?.displayName}</p>
                      <p className="text-xs text-slate-500">Deduct: {adv.monthDeduction}</p>
                    </div>
                    <p className="font-bold text-emerald-600">₹{adv.amount}</p>
                  </div>
                  <p className="text-sm text-slate-600 italic mb-3">"{adv.reason}"</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleAdvanceStatus(adv.id, 'Approved')} className="flex-1 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 py-1.5 rounded transition-colors">Approve</button>
                    <button onClick={() => handleAdvanceStatus(adv.id, 'Rejected')} className="flex-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 py-1.5 rounded transition-colors">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Payslips Table */}
        <Card className={`p-6 ${isAdmin ? 'col-span-2' : 'col-span-2'}`}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText size={20} className="text-slate-500" /> {isAdmin ? 'All Generated Payslips' : 'My Payslips'}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-sm font-bold text-slate-400">Month</th>
                  {isAdmin && <th className="pb-3 text-sm font-bold text-slate-400">Employee</th>}
                  <th className="pb-3 text-sm font-bold text-slate-400">Days Present</th>
                  <th className="pb-3 text-sm font-bold text-slate-400">Gross</th>
                  <th className="pb-3 text-sm font-bold text-slate-400">Net Pay</th>
                  <th className="pb-3 text-sm font-bold text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.length === 0 ? (
                  <tr><td colSpan="6" className="py-4 text-center text-slate-500">No payslips found.</td></tr>
                ) : (
                  payrolls.map(pay => (
                    <tr key={pay.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-semibold text-slate-800">{pay.month}</td>
                      {isAdmin && <td className="py-3 text-sm text-slate-600">{pay.user?.displayName}</td>}
                      <td className="py-3 text-sm text-slate-600">{pay.payableDays} days</td>
                      <td className="py-3 text-sm text-slate-600">₹{pay.grossSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="py-3 font-bold text-emerald-600">₹{pay.netSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="py-3 text-right">
                        <button className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors px-2 py-1 rounded">
                          <Download size={14} /> PDF
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
    </div>
  );
};

export default Payroll;

