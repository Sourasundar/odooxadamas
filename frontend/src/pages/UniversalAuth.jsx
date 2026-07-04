import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function UniversalAuth({ defaultIsSignUp = false }) {
  const [isSignUp, setIsSignUp] = useState(defaultIsSignUp);
  const navigate = useNavigate();
  const location = useLocation();

  // Login State
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup State
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    department: '',
    password: '',
    confirmPassword: ''
  });
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');

  useEffect(() => {
    // If user navigates to /signup, switch to sign up panel, else login
    if (location.pathname === '/signup') {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
    }
  }, [location.pathname]);

  const togglePanel = (toSignUp) => {
    setIsSignUp(toSignUp);
    // Optionally update URL without reloading
    window.history.pushState(null, '', toSignUp ? '/signup' : '/login');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: loginPassword })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (data.user.mustChangePassword) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError('');

    if (formData.password !== formData.confirmPassword) {
      setSignupError('Passwords do not match');
      setSignupLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to sign up');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setSignupError(err.message);
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="auth-page-bg mesh-bg">
      <div className="auth-wrapper">
        <div className={`auth-container ${isSignUp ? 'right-panel-active' : ''}`}>
          
          {/* 1. SIGN UP PANEL */}
          <div className="auth-form-container sign-up-container">
            <form onSubmit={handleSignup} className="space-y-4">
              <h1 className="text-3xl font-bold text-center text-gray-900 mb-2 font-serif">Create Account</h1>
              
              {signupError && (
                <div className="p-2 text-sm rounded-lg border font-medium text-danger bg-danger/10 border-danger/20">
                  {signupError}
                </div>
              )}

              <input required name="displayName" type="text" placeholder="Name" value={formData.displayName} onChange={handleSignupChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-[#5D5FEF]" />
              <input required name="email" type="email" placeholder="Email" value={formData.email} onChange={handleSignupChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-[#5D5FEF]" />
              <input name="phone" type="tel" placeholder="Phone" value={formData.phone} onChange={handleSignupChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-[#5D5FEF]" />
              <input required name="department" type="text" placeholder="Department" value={formData.department} onChange={handleSignupChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-[#5D5FEF]" />
              
              <div className="flex gap-2">
                <input required name="password" type="password" placeholder="Password" value={formData.password} onChange={handleSignupChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-[#5D5FEF]" />
                <input required name="confirmPassword" type="password" placeholder="Confirm" value={formData.confirmPassword} onChange={handleSignupChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-[#5D5FEF]" />
              </div>
              
              <button type="submit" disabled={signupLoading} className="w-full rounded-xl bg-[#5D5FEF] px-4 py-3 font-semibold text-white hover:bg-[#4B4DD9] transition-colors disabled:opacity-70">
                {signupLoading ? 'Creating Account...' : 'Sign Up'}
              </button>

              {/* Mobile toggle link */}
              <div className="mt-4 text-center md:hidden">
                <button type="button" onClick={() => togglePanel(false)} className="text-sm text-gray-500">
                  Already have an account? <span className="text-[#5D5FEF] font-medium">Sign In</span>
                </button>
              </div>
            </form>
          </div>

          {/* 2. SIGN IN PANEL */}
          <div className="auth-form-container sign-in-container">
            <form onSubmit={handleLogin} className="space-y-4">
              <h1 className="text-3xl font-bold text-center text-gray-900 mb-2 font-serif">Welcome Back</h1>
              
              {loginError && (
                <div className="p-3 text-sm rounded-lg border font-medium text-danger bg-danger/10 border-danger/20">
                  {loginError}
                </div>
              )}

              <input required type="text" placeholder="Login Id / Email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-[#5D5FEF]" />
              <input required type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-[#5D5FEF]" />
              
              <button type="submit" disabled={loginLoading} className="w-full rounded-xl bg-[#5D5FEF] px-4 py-3 mt-4 font-semibold text-white hover:bg-[#4B4DD9] transition-colors disabled:opacity-70">
                {loginLoading ? 'Signing In...' : 'Sign In'}
              </button>

              {/* Mobile toggle link */}
              <div className="mt-4 text-center md:hidden">
                <button type="button" onClick={() => togglePanel(true)} className="text-sm text-gray-500">
                  Don't have an account? <span className="text-[#5D5FEF] font-medium">Sign Up</span>
                </button>
              </div>
            </form>
          </div>

          {/* 3. DESKTOP OVERLAY CONTAINER (Hidden on Mobile) */}
          <div className="auth-overlay-container hidden md:block">
            <div className="auth-overlay mesh-bg">
              
              {/* Left Overlay (Shown when signing up) */}
              <div className="auth-overlay-panel auth-overlay-left">
                <h2 className="text-3xl font-bold mb-4 font-serif">Welcome Back!</h2>
                <p className="text-sm mb-8">To keep connected with us please login with your personal info</p>
                <button onClick={() => togglePanel(false)} className="rounded-xl border-2 border-gray-900 px-12 py-3 font-semibold text-gray-900 hover:bg-gray-900 hover:text-white transition-colors">
                  Sign In
                </button>
              </div>
              
              {/* Right Overlay (Shown when signing in) */}
              <div className="auth-overlay-panel auth-overlay-right">
                <h2 className="text-3xl font-bold mb-4 font-serif">Hello, Friend!</h2>
                <p className="text-sm mb-8">Enter your personal details and start your journey with us</p>
                <button onClick={() => togglePanel(true)} className="rounded-xl border-2 border-gray-900 px-12 py-3 font-semibold text-gray-900 hover:bg-gray-900 hover:text-white transition-colors">
                  Sign Up
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
