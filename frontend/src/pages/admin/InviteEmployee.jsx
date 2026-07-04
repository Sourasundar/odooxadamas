import React, { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, Send } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

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
    <Card className="p-6 max-w-3xl !rounded-[24px]">
      <div className="flex items-center gap-3 mb-6 border-b border-border-subtle pb-4">
        <div className="w-10 h-10 bg-accent-primary/10 rounded-lg flex items-center justify-center text-accent-primary">
          <Mail size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Invite Employees</h2>
          <p className="text-sm text-text-secondary mt-1">Provide an email address. They will be required to fill out their own details during Sign Up.</p>
        </div>
      </div>

      <form onSubmit={handleInvite} className="flex gap-3 mb-8">
        <div className="flex-1">
          <Input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter employee's email address..."
            required
          />
          {error && <p className="text-danger text-xs mt-1">{error}</p>}
        </div>
        <Button
          type="submit"
          className="gap-2 shrink-0"
        >
          <Send size={16} /> Send Invite
        </Button>
      </form>

      <div>
        <h3 className="font-semibold text-text-primary mb-3">Pending Invitations</h3>
        {loading ? (
          <p className="text-sm text-text-secondary">Loading...</p>
        ) : (
          <ul className="divide-y divide-border-subtle border border-border-default rounded-lg">
            {emails.length === 0 ? (
              <li className="p-4 text-center text-sm text-text-secondary">No pending invitations. When invited employees sign up, they are removed from this list.</li>
            ) : (
              emails.map((item) => (
                <li key={item.id} className="p-4 flex items-center justify-between hover:bg-surface-card transition-colors">
                  <span className="text-sm font-medium text-text-primary">{item.email}</span>
                  <button
                    onClick={() => handleRemove(item.email)}
                    className="text-danger hover:text-danger/80 p-1.5 hover:bg-danger/10 rounded-md transition-colors"
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
    </Card>
  );
};

export default InviteEmployee;
