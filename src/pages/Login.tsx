import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else if (res.nextStep === 'verify-email') {
      toast.error(res.message || 'Please verify your email');
      navigate('/register', { state: { userId: res.userId, step: 'verify-email', email } });
    } else if (res.nextStep === 'verify-phone') {
      toast.error(res.message || 'Please verify your phone');
      navigate('/register', { state: { userId: res.userId, step: 'verify-phone' } });
    } else {
      toast.error(res.message || 'Login failed');
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

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">Email Address</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors"
              />
            </div>

            <div className="mb-2">
              <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                  placeholder="Your password"
                  className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 pr-12 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors"
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

            <button type="submit" disabled={loading} className="btn-gold w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={14} /></>}
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
