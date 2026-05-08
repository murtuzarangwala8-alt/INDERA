import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, MapPin, ShoppingBag, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'security', label: 'Security', icon: Shield },
];

const Account: React.FC = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  if (loading) return (
    <div className="min-h-screen bg-ivory pt-20 flex items-center justify-center">
      <div className="w-8 h-8 border border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: '/account' }} replace />;

  return (
    <div className="min-h-screen bg-ivory pt-20">
      {/* Header */}
      <div className="bg-obsidian py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-gold-400 text-[10px] tracking-[0.4em] uppercase font-sans mb-2">My Account</p>
            <h1 className="font-serif text-ivory text-4xl font-light">
              {user?.firstName} {user?.lastName}
            </h1>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-ivory/40 text-xs font-sans">{user?.email}</span>
              <span className="text-ivory/20 text-xs">·</span>
              <span className="text-ivory/40 text-xs font-sans">{user?.phone}</span>
              <div className="flex gap-2 ml-2">
                {user?.emailVerified && (
                  <span className="text-[9px] tracking-widest uppercase font-sans text-green-400/70 border border-green-400/20 px-2 py-0.5">Email ✓</span>
                )}
                {user?.phoneVerified && (
                  <span className="text-[9px] tracking-widest uppercase font-sans text-green-400/70 border border-green-400/20 px-2 py-0.5">Phone ✓</span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs tracking-widest uppercase font-sans transition-all ${
                    activeTab === tab.id
                      ? 'bg-obsidian text-gold-400 border-l-2 border-gold-400'
                      : 'text-obsidian/50 hover:text-obsidian border-l-2 border-transparent'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs tracking-widest uppercase font-sans text-obsidian/30 hover:text-terracotta border-l-2 border-transparent transition-all mt-4"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

              {activeTab === 'profile' && (
                <div className="bg-white border border-obsidian/6 p-8" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <h2 className="font-serif text-obsidian text-2xl font-light mb-6">Personal Information</h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    {[
                      { label: 'First Name', value: user?.firstName },
                      { label: 'Last Name', value: user?.lastName },
                      { label: 'Email Address', value: user?.email },
                      { label: 'Phone Number', value: user?.phone },
                    ].map((field) => (
                      <div key={field.label}>
                        <label className="block text-[10px] tracking-widest uppercase font-sans text-obsidian/40 mb-2">{field.label}</label>
                        <p className="text-obsidian font-sans text-sm py-3 px-4 border border-obsidian/8 bg-ivory/50">{field.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-obsidian/30 text-xs font-sans mt-6">
                    To update your profile details, please contact <span className="text-gold-500">support@indera.com</span>
                  </p>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="bg-white border border-obsidian/6 p-8" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <h2 className="font-serif text-obsidian text-2xl font-light mb-6">Order History</h2>
                  <div className="text-center py-16">
                    <ShoppingBag size={40} className="mx-auto mb-4 text-obsidian/15" />
                    <p className="font-serif text-obsidian/40 text-xl font-light">No orders yet</p>
                    <p className="text-obsidian/30 text-xs font-sans mt-2">Your orders will appear here once you make a purchase.</p>
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="bg-white border border-obsidian/6 p-8" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <h2 className="font-serif text-obsidian text-2xl font-light mb-6">Saved Addresses</h2>
                  <div className="text-center py-16">
                    <MapPin size={40} className="mx-auto mb-4 text-obsidian/15" />
                    <p className="font-serif text-obsidian/40 text-xl font-light">No addresses saved</p>
                    <p className="text-obsidian/30 text-xs font-sans mt-2">Addresses saved during checkout will appear here.</p>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="bg-white border border-obsidian/6 p-8" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <h2 className="font-serif text-obsidian text-2xl font-light mb-6">Security</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Email Verified', status: user?.emailVerified, value: user?.email },
                      { label: 'Phone Verified', status: user?.phoneVerified, value: user?.phone },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-4 border border-obsidian/8">
                        <div>
                          <p className="text-xs tracking-widest uppercase font-sans text-obsidian/50">{item.label}</p>
                          <p className="text-obsidian font-sans text-sm mt-0.5">{item.value}</p>
                        </div>
                        <span className={`text-[9px] tracking-widest uppercase font-sans px-3 py-1 border ${
                          item.status ? 'text-green-600 border-green-200 bg-green-50' : 'text-terracotta border-terracotta/20 bg-terracotta/5'
                        }`}>
                          {item.status ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-obsidian/6">
                      <button
                        onClick={() => toast('Password reset email sent', { icon: '📧' })}
                        className="btn-outline text-xs py-3"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
