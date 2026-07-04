import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const ManageAdmins = () => {
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEmails = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/users/admin-emails', {
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

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/users/admin-emails', {
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
      const res = await fetch(`http://localhost:5000/api/users/admin-emails/${emailToRemove}`, {
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
    <Card className="p-6 max-w-3xl !rounded-[24px]">
      <div className="flex items-center gap-3 mb-6 border-b border-border-subtle pb-4">
        <div className="w-10 h-10 bg-accent-primary/10 rounded-lg flex items-center justify-center text-accent-primary">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Manage Admins</h2>
          <p className="text-sm text-text-secondary mt-1">Authorize emails that will automatically get Admin access upon signup.</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-warning/10 rounded-lg border border-warning/20 flex gap-3 text-text-primary text-sm">
        <ShieldAlert size={18} className="flex-shrink-0 mt-0.5 text-warning" />
        <div>
          <p className="font-semibold text-warning">Permanent Admin</p>
          <p className="text-text-secondary">barshanmajumdar249@gmail.com is permanently set as an admin and cannot be removed.</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex gap-3 mb-8">
        <div className="flex-1">
          <Input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter email address..."
            required
          />
          {error && <p className="text-danger text-xs mt-1">{error}</p>}
        </div>
        <Button
          type="submit"
          className="gap-2 shrink-0"
        >
          <Plus size={16} /> Add Admin
        </Button>
      </form>

      <div>
        <h3 className="font-semibold text-text-primary mb-3">Authorized Emails</h3>
        {loading ? (
          <p className="text-sm text-text-secondary">Loading...</p>
        ) : (
          <ul className="divide-y divide-border-subtle border border-border-default rounded-lg">
            {emails.length === 0 ? (
              <li className="p-4 text-center text-sm text-text-secondary">No additional admin emails found.</li>
            ) : (
              emails.map((item) => (
                <li key={item.id} className="p-4 flex items-center justify-between hover:bg-surface-card transition-colors">
                  <span className="text-sm font-medium text-text-primary">{item.email}</span>
                  <button
                    onClick={() => handleRemove(item.email)}
                    className="text-danger hover:text-danger/80 p-1.5 hover:bg-danger/10 rounded-md transition-colors"
                    title="Remove Access"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </Card>
  );
};

export default ManageAdmins;
