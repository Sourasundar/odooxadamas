import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Zap, Clock, CalendarDays, Wallet, Building } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const Landing = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-border-subtle bg-surface-glass backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-primary text-white flex items-center justify-center">
              <Building size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-text-primary">
              HRMS
            </span>
          </div>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-sm">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" className="text-sm px-5 py-2">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight mb-5 leading-tight">
            Human Resource <br className="hidden sm:block" /> Management System
          </h1>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Streamline your workforce management with automated payroll computation, real-time attendance tracking, and secure role-based access — all in one platform.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/signup">
              <Button variant="primary" className="px-8 py-3 shadow-md">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="px-8 py-3 bg-surface-glass backdrop-blur-md">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-text-primary">Everything you need to manage your team</h2>
              <p className="text-text-secondary mt-2 text-sm">Built for growing companies that need a reliable, all-in-one HR solution.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: ShieldCheck, title: 'Secure RBAC', desc: 'Role-based access control with JWT authentication. Employees see only their data; Admins manage everything.' },
                { icon: Clock, title: 'Real-Time Attendance', desc: 'Check In / Check Out system with live status indicators. Track working hours and break times automatically.' },
                { icon: Wallet, title: 'Automated Payroll', desc: 'Auto-compute Basic, HRA, PF, LTA, Professional Tax and Fixed Allowance from a single wage input.' },
                { icon: Users, title: 'Employee Directory', desc: 'Visual employee cards with status indicators. Click any card to view full profile in read-only mode.' },
                { icon: CalendarDays, title: 'Leave Management', desc: 'Paid, Sick, and Unpaid leave types. Employees request, Admins approve/reject with one click.' },
                { icon: Zap, title: 'Auto-Generated IDs', desc: 'System generates employee IDs, temporary passwords, and handles first-login password changes.' },
              ].map(({ icon: Icon, title, desc }, i) => (
                <Card key={i} className="p-5 hover:scale-[1.02] transition-transform duration-300">
                  <div className="w-10 h-10 bg-accent-primary/10 text-accent-primary rounded-lg flex items-center justify-center mb-3">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-bold text-text-primary mb-1.5">{title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-text-primary py-8 text-center text-text-tertiary text-sm">
        <p>&copy; {new Date().getFullYear()} HRMS. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
