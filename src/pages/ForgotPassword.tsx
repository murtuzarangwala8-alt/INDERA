import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const ForgotPassword: React.FC = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await forgotPassword(email);
    setLoading(false);
    if (res.success) setSent(true);
    else toast.error(res.message || 'Something went wrong');
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
          {!sent ? (
            <>
              <h2 className="font-serif text-ivory text-2xl font-light mb-1">Reset Password</h2>
              <p className="text-ivory/40 text-xs font-sans mb-8">Enter your email and we'll send a reset link</p>
              <form onSubmit={handleSubmit}>
                <div className="mb-7">
                  <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com"
                    className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors" />
                </div>
                <button type="submit" disabled={loading} className="btn-gold w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? 'Sending...' : <><span>Send Reset Link</span><ArrowRight size={14} /></>}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full border border-gold-400/30 flex items-center justify-center mx-auto mb-5">
                <span className="text-gold-400 text-2xl">✓</span>
              </div>
              <h2 className="font-serif text-ivory text-2xl font-light mb-3">Check Your Email</h2>
              <p className="text-ivory/40 text-sm font-sans leading-relaxed">
                If an account exists for <span className="text-gold-400">{email}</span>, a reset link has been sent.
              </p>
            </div>
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
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    const res = await resetPassword(token, password);
    setLoading(false);
    if (res.success) {
      toast.success('Password reset successfully');
      navigate('/');
    } else {
      toast.error(res.message || 'Reset failed');
    }
  };

  if (!token) return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center">
      <p className="text-ivory/40 font-sans">Invalid reset link. <Link to="/forgot-password" className="text-gold-400">Request a new one</Link></p>
    </div>
  );

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
          <h2 className="font-serif text-ivory text-2xl font-light mb-1">New Password</h2>
          <p className="text-ivory/40 text-xs font-sans mb-8">Choose a strong password for your account</p>

          <form onSubmit={handleSubmit}>
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

            <div className="mt-7">
              <button type="submit" disabled={loading} className="btn-gold w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? 'Resetting...' : <><span>Reset Password</span><ArrowRight size={14} /></>}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
