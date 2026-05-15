import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { OAuthButtons } from '../components/OAuthButtons';
import toast from 'react-hot-toast';

type Step = 'details' | 'verify-phone';

const Register: React.FC = () => {
  const { register, verifyPhone, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialState = location.state as { userId?: string; step?: Step; email?: string; phone?: string } | null;

  const [step, setStep] = useState<Step>(initialState?.step || 'details');
  const [userId, setUserId] = useState(initialState?.userId || '');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [resending, setResending] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: initialState?.email || '',
    phone: initialState?.phone || '',
    password: '',
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    const res = await register(form);
    setLoading(false);

    if (res.success) {
      setUserId(res.userId!);
      setStep('verify-phone');
      if (res.whatsappSent === false) toast.error(res.message || 'Account created, but SMS code could not be sent');
      else toast.success('Check SMS for your verification code');
    } else {
      toast.error(res.message || 'Registration failed');
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneOtp.length !== 6) {
      toast.error('Enter the 6-digit code');
      return;
    }

    setLoading(true);
    const res = await verifyPhone(userId, phoneOtp);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      toast.error(res.message || 'Invalid code');
    }
  };

  const handleResend = async () => {
    setResending(true);
    const res = await resendOtp(userId, 'phone');
    setResending(false);
    if (res.success) toast.success(res.message || 'New SMS code sent');
    else toast.error(res.message || 'Failed to resend');
  };

  const stepIndex = { details: 0, 'verify-phone': 1 }[step];

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 py-20">
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex flex-col items-center">
            <span className="font-serif text-3xl font-light tracking-[0.2em] text-ivory">INDERA</span>
            <span className="text-[9px] tracking-[0.35em] text-gold-400 uppercase font-sans mt-1">Indo-European Jewelry</span>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3 mb-8">
          {['Account', 'SMS Verification'].map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-sans transition-all duration-300 ${
                  i < stepIndex ? 'bg-gold-400 text-obsidian' :
                  i === stepIndex ? 'border border-gold-400 text-gold-400' :
                  'border border-ivory/10 text-ivory/20'
                }`}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span className={`text-[9px] tracking-widest uppercase font-sans ${i === stepIndex ? 'text-gold-400' : 'text-ivory/20'}`}>
                  {label}
                </span>
              </div>
              {i < 1 && <div className={`w-10 h-px mb-4 transition-all duration-300 ${i < stepIndex ? 'bg-gold-400' : 'bg-ivory/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="glass-dark rounded-sm p-8" style={{ border: '1px solid rgba(201,168,76,0.15)' }}>
          <AnimatePresence mode="wait">
            {step === 'details' && (
              <motion.form key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleRegister}>
                <h2 className="font-serif text-ivory text-2xl font-light mb-1">Create Account</h2>
                <p className="text-ivory/40 text-xs font-sans mb-7">Join the INDERA private collection</p>

                <OAuthButtons />

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">First Name</label>
                    <input value={form.firstName} onChange={set('firstName')} required placeholder="Priya" className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">Last Name</label>
                    <input value={form.lastName} onChange={set('lastName')} required placeholder="Sharma" className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors" />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">Email Address</label>
                  <input type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com" className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors" />
                </div>

                <div className="mb-4">
                  <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">Phone Number</label>
                  <input type="tel" value={form.phone} onChange={set('phone')} required placeholder="+39 333 123 4567" className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors" />
                  <p className="text-ivory/20 text-[10px] font-sans mt-1">Include country code, for example +39 for Italy.</p>
                </div>

                <div className="mb-7">
                  <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} required placeholder="Min. 8 characters" className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 pr-12 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ivory/30 hover:text-ivory/60">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-gold w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? 'Creating Account...' : <><span>Create Account</span><ArrowRight size={14} /></>}
                </button>

                <p className="text-center text-ivory/30 text-xs font-sans mt-6">
                  Already have an account?{' '}
                  <Link to="/login" className="text-gold-400 hover:text-gold-300 transition-colors">Sign in</Link>
                </p>
              </motion.form>
            )}

            {step === 'verify-phone' && (
              <motion.form key="verify-phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleVerifyPhone}>
                <h2 className="font-serif text-ivory text-2xl font-light mb-1">Verify Phone</h2>
                <p className="text-ivory/40 text-xs font-sans mb-2">We sent a 6-digit SMS code to</p>
                <p className="text-gold-400 text-sm font-sans mb-7">{form.phone}</p>

                <div className="mb-7">
                  <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">SMS Code</label>
                  <input value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-4 text-2xl font-serif tracking-[0.5em] text-center outline-none focus:border-gold-400/50 transition-colors" />
                </div>

                <button type="submit" disabled={loading || phoneOtp.length !== 6} className="btn-gold w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? 'Verifying...' : <><span>Complete Setup</span><ArrowRight size={14} /></>}
                </button>

                <div className="flex items-center justify-between mt-5">
                  <button type="button" onClick={() => setStep('details')} className="flex items-center gap-1 text-ivory/30 hover:text-ivory/60 text-xs font-sans transition-colors">
                    <ArrowLeft size={12} /> Back
                  </button>
                  <button type="button" onClick={handleResend} disabled={resending} className="flex items-center gap-1 text-gold-400/60 hover:text-gold-400 text-xs font-sans transition-colors disabled:opacity-40">
                    <RefreshCw size={12} className={resending ? 'animate-spin' : ''} /> Resend SMS
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-ivory/15 text-[10px] font-sans mt-6 leading-relaxed">
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
