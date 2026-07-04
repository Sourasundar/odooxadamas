import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Clock, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

const Attendance = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [myAttendance, setMyAttendance] = useState([]);
  const [todayAdminData, setTodayAdminData] = useState([]);

  const isAdmin = user?.role === 'Admin';

  const fetchMyData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/attendance/me`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setMyAttendance(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const fetchAdminData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/attendance/today`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setTodayAdminData(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (isAdmin) fetchAdminData();
    fetchMyData();
  }, [isAdmin]);

  const handleClockAction = async (action) => {
    setLoading(true);
    setStatusMsg('');
    
    // Geofencing for clock-in
    let locationData = {};
    if (action === 'clock-in') {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
      } catch (err) {
        console.warn('Geolocation failed:', err);
        // We will still send the request, but backend will flag it as suspicious since no coords
      }
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/attendance/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(locationData)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Action failed');
      
      setStatusMsg(`Successfully ${action === 'clock-in' ? 'Clocked In' : 'Clocked Out'}!`);
      fetchMyData();
    } catch (error) {
      setStatusMsg(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Determine today's status for the employee
  const todayRecord = myAttendance.find(a => new Date(a.date).toDateString() === new Date().toDateString());
  const isClockedIn = todayRecord && !todayRecord.checkOut;
  const isClockedOut = todayRecord && todayRecord.checkOut;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">Time & Attendance</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Clock In / Out Widget */}
        <Card className="p-8 text-center bg-gradient-to-br from-indigo-50 to-white">
          <Clock size={48} className="mx-auto text-indigo-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Live Time Clock</h2>
          <p className="text-slate-500 mb-6 text-sm">
            Make sure you are at the office or your clock-in will be flagged.
          </p>
          
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => handleClockAction('clock-in')}
              disabled={isClockedIn || isClockedOut || loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Clock In
            </Button>
            <Button 
              onClick={() => handleClockAction('clock-out')}
              disabled={!isClockedIn || isClockedOut || loading}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              Clock Out
            </Button>
          </div>
          
          {statusMsg && (
            <div className={`mt-4 p-4 text-sm rounded-lg border flex flex-col items-start gap-1 text-left ${statusMsg.includes('Error') ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
              <div className="flex gap-2 items-center">
                <span className="font-semibold">{statusMsg.includes('Error') ? 'Error:' : 'Success:'}</span>
                <span>{statusMsg.replace('Error: ', '')}</span>
              </div>
            </div>
          )}

          {todayRecord && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-slate-100 shadow-sm text-left">
              <p className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-2">Today's Status</p>
              <p className="text-slate-800"><span className="font-semibold">In:</span> {new Date(todayRecord.checkIn).toLocaleTimeString()}</p>
              {todayRecord.checkOut && (
                <p className="text-slate-800"><span className="font-semibold">Out:</span> {new Date(todayRecord.checkOut).toLocaleTimeString()}</p>
              )}
              {todayRecord.status === 'Absent' && (
                <p className="text-red-500 font-bold flex items-center gap-1 mt-2">
                  <AlertCircle size={14} /> Flagged: Suspicious Location
                </p>
              )}
            </div>
          )}
        </Card>

        {/* My Recent History */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">My Recent Logs</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
            {myAttendance.length === 0 ? (
              <p className="text-slate-500 text-sm">No attendance records yet.</p>
            ) : (
              myAttendance.map(log => (
                <div key={log.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-800">{new Date(log.date).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-500">{log.workHours.toFixed(1)} hrs logged</p>
                  </div>
                  <div>
                    {log.status === 'Absent' ? (
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Flagged</span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded">Present</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Admin View: Today's Status Grid */}
      {isAdmin && (
        <Card className="p-6 mt-8">
          <h3 className="text-xl font-bold mb-4">Today's Live Company Status</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-sm font-bold text-slate-400">Employee</th>
                  <th className="pb-3 text-sm font-bold text-slate-400">Clock In</th>
                  <th className="pb-3 text-sm font-bold text-slate-400">Clock Out</th>
                  <th className="pb-3 text-sm font-bold text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAdminData.length === 0 ? (
                  <tr><td colSpan="4" className="py-4 text-center text-slate-500">No one has clocked in today yet.</td></tr>
                ) : (
                  todayAdminData.map(record => (
                    <tr key={record.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 font-semibold text-slate-800">{record.user.displayName}</td>
                      <td className="py-3 text-sm text-slate-600">{new Date(record.checkIn).toLocaleTimeString()}</td>
                      <td className="py-3 text-sm text-slate-600">{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '--:--'}</td>
                      <td className="py-3">
                        {record.status === 'Absent' ? (
                           <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Suspicious Location</span>
                        ) : (
                           <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded flex items-center w-max gap-1"><CheckCircle size={12}/> Valid</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Attendance;

