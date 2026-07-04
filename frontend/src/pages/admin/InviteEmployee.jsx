import React, { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, Send } from 'lucide-react';

const InviteEmployee = () => {
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEmails = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/users/invited-emails', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmails(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/users/invited-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: newEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNewEmail('');
      fetchEmails();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = async (emailToRemove) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/users/invited-emails/${emailToRemove}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      fetchEmails();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-3xl">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
          <Mail size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Invite Employees</h2>
          <p className="text-sm text-slate-500">Provide an email address. They will be required to fill out their own details during Sign Up.</p>
        </div>
      </div>

      <form onSubmit={handleInvite} className="flex gap-3 mb-8">
        <div className="flex-1">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter employee's email address..."
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
        <button
          type="submit"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Send size={16} /> Send Invite
        </button>
      </form>

      <div>
        <h3 className="font-semibold text-slate-800 mb-3">All Invitations</h3>
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : (
          <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
            {emails.length === 0 ? (
              <li className="p-4 text-center text-sm text-slate-500">No invitations sent yet.</li>
            ) : (
              emails.map((item) => (
                <li key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <span className="text-sm font-medium text-slate-700">{item.email}</span>
                  <button
                    onClick={() => handleRemove(item.email)}
                    className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-md transition-colors"
                    title="Revoke Invite"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default InviteEmployee;
