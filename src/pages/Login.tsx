import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { OAuthButtons } from '../components/OAuthButtons';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const { login, requestLoginOtp, verifyLoginOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/';

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(phone, password);
    setLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else if (res.nextStep === 'verify-phone') {
      toast.error(res.message || 'Please verify your phone number via SMS');
      navigate('/register', { state: { userId: res.userId, step: 'verify-phone' } });
    } else {
      toast.error(res.message || 'Login failed');
    }
  };

  const handleOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await requestLoginOtp(phone);
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      toast.success(res.message || 'Login code sent via SMS');
    } else {
      toast.error(res.message || 'Could not send login code');
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await verifyLoginOtp(phone, otp);
    setLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      toast.error(res.message || 'Invalid code');
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 py-20">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex flex-col items-center">
            <span className="font-serif text-3xl font-light tracking-[0.2em] text-ivory">INDÉRA</span>
            <span className="text-[9px] tracking-[0.35em] text-gold-400 uppercase font-sans mt-1">Indo-European Jewelry</span>
          </Link>
        </div>

        <div className="glass-dark rounded-sm p-8" style={{ border: '1px solid rgba(201,168,76,0.15)' }}>
          <h2 className="font-serif text-ivory text-2xl font-light mb-1">Welcome Back</h2>
          <p className="text-ivory/40 text-xs font-sans mb-8">Sign in to your INDÉRA account</p>

          <OAuthButtons redirectTo={from} />

          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              type="button"
              onClick={() => setLoginMode('password')}
              className={`py-2 text-[10px] uppercase tracking-widest font-sans border transition-colors ${loginMode === 'password' ? 'border-gold-400 text-gold-400 bg-gold-400/10' : 'border-ivory/10 text-ivory/40 hover:text-ivory/70'}`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('otp')}
              className={`py-2 text-[10px] uppercase tracking-widest font-sans border transition-colors ${loginMode === 'otp' ? 'border-gold-400 text-gold-400 bg-gold-400/10' : 'border-ivory/10 text-ivory/40 hover:text-ivory/70'}`}
            >
              SMS OTP
            </button>
          </div>

          <form onSubmit={loginMode === 'otp' && otpSent ? handleOtpVerify : loginMode === 'otp' ? handleOtpRequest : handlePasswordSubmit}>
            <div className="mb-4">
              <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">Phone Number</label>
              <input
                type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                placeholder="+39 333 123 4567"
                className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-base font-sans outline-none focus:border-gold-400/50 transition-colors"
              />
            </div>

            {loginMode === 'password' ? (
              <>
                <div className="mb-2">
                  <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                      placeholder="Your password"
                      className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 pr-12 text-base font-sans outline-none focus:border-gold-400/50 transition-colors"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ivory/30 hover:text-ivory/60">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end mb-7">
                  <Link to="/forgot-password" className="text-gold-400/60 hover:text-gold-400 text-xs font-sans transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </>
            ) : otpSent ? (
              <div className="mb-7">
                <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">SMS Code</label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-4 text-2xl font-serif tracking-[0.5em] text-center outline-none focus:border-gold-400/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    setOtp('');
                    setOtpSent(false);
                  }}
                  className="flex items-center gap-1 text-gold-400/60 hover:text-gold-400 text-xs font-sans transition-colors mt-3"
                >
                  <RefreshCw size={12} /> Send a new code
                </button>
              </div>
            ) : null}

            <button type="submit" disabled={loading || (loginMode === 'otp' && otpSent && otp.length !== 6)} className="btn-gold w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Please wait...' : <><span>{loginMode === 'otp' ? (otpSent ? 'Verify Code' : 'Send Login Code') : 'Sign In'}</span><ArrowRight size={14} /></>}
            </button>
          </form>

          <p className="text-center text-ivory/30 text-xs font-sans mt-6">
            New to INDÉRA?{' '}
            <Link to="/register" className="text-gold-400 hover:text-gold-300 transition-colors">Create account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
