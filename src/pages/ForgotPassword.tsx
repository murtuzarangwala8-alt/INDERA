import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const ForgotPassword: React.FC = () => {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await forgotPassword(identifier);
    setLoading(false);
    if (res.success) {
      setStep('otp');
      if (res.smsSent === false) {
        toast.error('SMS sending failed. Please contact support.');
      } else {
        toast.success('Check your phone for the reset code');
      }
    } else {
      toast.error(res.message || 'Something went wrong');
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    
    setLoading(true);
    const res = await resetPassword(identifier, otp, password);
    setLoading(false);
    if (res.success) {
      toast.success('Password reset successfully');
      navigate('/');
    } else {
      toast.error(res.message || 'Reset failed');
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 py-20">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex flex-col items-center">
            <span className="font-serif text-3xl font-light tracking-[0.2em] text-ivory">INDÉRA</span>
            <span className="text-[9px] tracking-[0.35em] text-gold-400 uppercase font-sans mt-1">Indo-European Jewelry</span>
          </Link>
        </div>

        <div className="glass-dark rounded-sm p-8" style={{ border: '1px solid rgba(201,168,76,0.15)' }}>
          {step === 'email' ? (
            <>
              <h2 className="font-serif text-ivory text-2xl font-light mb-1">Reset Password</h2>
              <p className="text-ivory/40 text-xs font-sans mb-8">Enter your email or phone number and we'll text you an OTP code.</p>
              <form onSubmit={handleSendOtp}>
                <div className="mb-7">
                  <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">Email Address or Phone Number</label>
                  <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required placeholder="you@example.com or +1234567890"
                    className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors" />
                </div>
                <button type="submit" disabled={loading} className="btn-gold w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? 'Sending...' : <><span>Send OTP Code</span><ArrowRight size={14} /></>}
                </button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="font-serif text-ivory text-2xl font-light mb-1">Enter Code & New Password</h2>
              <p className="text-ivory/40 text-xs font-sans mb-8">Check your SMS messages</p>
              <form onSubmit={handleReset}>
                <div className="mb-4">
                  <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">6-Digit Code</label>
                  <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required placeholder="000000" maxLength={6}
                    className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-4 text-2xl font-serif tracking-[0.5em] text-center outline-none focus:border-gold-400/50 transition-colors" />
                </div>

                {[
                  { label: 'New Password', value: password, set: setPassword },
                  { label: 'Confirm Password', value: confirm, set: setConfirm },
                ].map(({ label, value, set }) => (
                  <div key={label} className="mb-4">
                    <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">{label}</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={value} onChange={(e) => set(e.target.value)} required placeholder="Min. 8 characters"
                        className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 pr-12 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ivory/30 hover:text-ivory/60">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}

                <button type="submit" disabled={loading} className="btn-gold w-full py-4 mt-6 flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? 'Resetting...' : <><span>Reset Password</span><ArrowRight size={14} /></>}
                </button>
              </form>
            </motion.div>
          )}

          <div className="flex justify-center mt-6">
            <Link to="/login" className="flex items-center gap-1 text-ivory/30 hover:text-ivory/60 text-xs font-sans transition-colors">
              <ArrowLeft size={12} /> Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  React.useEffect(() => { navigate('/forgot-password', { replace: true }); }, [navigate]);
  return null;
};
