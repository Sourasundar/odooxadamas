import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Zap, Clock, CalendarDays, Wallet, Building } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Landing = () => {
  const container = useRef(null);
  
  useGSAP(() => {
    // Background subtle orb animation
    gsap.to(".bg-orb", {
      y: "random(-30, 30)",
      x: "random(-30, 30)",
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 1
    });

    // Hero Section Entrance
    const tl = gsap.timeline();
    tl.fromTo(".hero-element", 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out", delay: 0.1 }
    );

    // Staggered Cards on Scroll
    gsap.fromTo(".feature-card",
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".features-grid",
          start: "top 85%",
        }
      }
    );
  }, { scope: container });

  // 3D Tilt Effect on Mouse Move
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
    const rotateY = ((x - centerX) / centerX) * 10;
    
    gsap.to(card, {
      rotateX,
      rotateY,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 1200
    });
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: "power2.out"
    });
  };

  return (
    <div ref={container} className="flex flex-col min-h-screen relative overflow-hidden">
      
      {/* Subtle Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="bg-orb absolute top-[10%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-blue-400/10 blur-[100px]"></div>
        <div className="bg-orb absolute bottom-[10%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-indigo-400/10 blur-[100px]"></div>
      </div>

      {/* Navbar */}
      <nav className="border-b border-border-subtle ag-glass sticky top-0 z-50">
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
              <Button variant="ghost" className="text-sm nav-btn hover:scale-105 transition-transform duration-300">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" className="text-sm px-5 py-2 nav-btn hover:scale-105 transition-transform duration-300">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-grow z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative">
          <h1 className="hero-element text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight mb-5 leading-tight">
            Human Resource <br className="hidden sm:block" /> Management System
          </h1>
          <p className="hero-element mt-4 text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Streamline your workforce management with automated payroll computation, real-time attendance tracking, and secure role-based access — all in one platform.
          </p>
          <div className="hero-element flex justify-center gap-4">
            <Link to="/signup">
              <Button variant="primary" className="px-8 py-3 hover:-translate-y-1 transition-all duration-300">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="px-8 py-3 border-transparent hover:-translate-y-1 transition-all duration-300">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="py-16 features-grid relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 hero-element">
              <h2 className="text-2xl font-bold text-text-primary">Everything you need to manage your team</h2>
              <p className="text-text-secondary mt-2 text-sm">Built for growing companies that need a reliable, all-in-one HR solution.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ag-perspective">
              {[
                { icon: ShieldCheck, title: 'Secure RBAC', desc: 'Role-based access control with JWT authentication. Employees see only their data; Admins manage everything.' },
                { icon: Clock, title: 'Real-Time Attendance', desc: 'Check In / Check Out system with live status indicators. Track working hours and break times automatically.' },
                { icon: Wallet, title: 'Automated Payroll', desc: 'Auto-compute Basic, HRA, PF, LTA, Professional Tax and Fixed Allowance from a single wage input.' },
                { icon: Users, title: 'Employee Directory', desc: 'Visual employee cards with status indicators. Click any card to view full profile in read-only mode.' },
                { icon: CalendarDays, title: 'Leave Management', desc: 'Paid, Sick, and Unpaid leave types. Employees request, Admins approve/reject with one click.' },
                { icon: Zap, title: 'Auto-Generated IDs', desc: 'System generates employee IDs, temporary passwords, and handles first-login password changes.' },
              ].map(({ icon: Icon, title, desc }, i) => (
                <Card 
                  key={i} 
                  className="feature-card p-5 ag-tilt-card bg-surface-glass-solid hover:ag-shadow-weightless border border-white/60 relative overflow-hidden"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="w-10 h-10 bg-accent-primary/10 text-accent-primary rounded-lg flex items-center justify-center mb-3 transition-colors duration-300">
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
      <footer className="bg-text-primary py-8 text-center text-text-tertiary text-sm z-10 relative">
        <p>&copy; {new Date().getFullYear()} HRMS. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
