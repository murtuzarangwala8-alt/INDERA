import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, MapPin, ShoppingBag, Shield, LogOut, Save, Trash2, Plus } from 'lucide-react';
import { ShippingAddress, useAuth } from '../context/AuthContext';
import { cancelMyOrder } from '../services/api';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'security', label: 'Security', icon: Shield },
];

const emptyAddress: ShippingAddress = {
  label: 'Home',
  address: '',
  city: '',
  zipCode: '',
  country: '',
  isDefault: false,
};

const Account: React.FC = () => {
  const { user, token, isAuthenticated, loading, logout, updateProfile, addAddress, deleteAddress, fetchOrders, forgotPassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '' });
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile({ firstName: user.firstName, lastName: user.lastName, phone: user.phone });
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchOrders().then((data) => {
      if (data.success) setOrders((data.orders as any[]) || []);
    }).catch(() => undefined);
  }, [isAuthenticated]);

  if (loading) return (
    <div className="min-h-screen bg-ivory pt-20 flex items-center justify-center">
      <div className="w-8 h-8 border border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: '/account' }} replace />;

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const response = await updateProfile(profile);
    setSaving(false);
    if (response.success) toast.success('Profile updated');
    else toast.error(response.message || 'Could not update profile');
  };

  const saveAddress = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await addAddress(address);
    if (response.success) {
      toast.success('Address saved');
      setAddress(emptyAddress);
    } else {
      toast.error(response.message || 'Could not save address');
    }
  };

  const removeAddress = async (id?: string) => {
    if (!id) return;
    const response = await deleteAddress(id);
    if (response.success) toast.success('Address removed');
    else toast.error(response.message || 'Could not remove address');
  };

  const sendPasswordReset = async () => {
    if (!user?.phone) return;
    const response = await forgotPassword(user.phone);
    if (response.success) toast.success('Password reset code sent');
    else toast.error(response.message || 'Could not send reset SMS');
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    if (!token) return;
    
    try {
      const response = await cancelMyOrder(orderId, token);
      if (response.success) {
        toast.success('Order cancelled successfully');
        // Refresh orders
        const data = await fetchOrders();
        if (data.success) setOrders((data.orders as any[]) || []);
      } else {
        toast.error(response.message || 'Could not cancel order');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-ivory pt-20">
      <div className="bg-obsidian py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-gold-400 text-[10px] tracking-[0.4em] uppercase font-sans mb-2">My Account</p>
            <h1 className="font-serif text-ivory text-4xl font-light">{user?.firstName} {user?.lastName}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {user?.email && <span className="text-ivory/40 text-xs font-sans">{user.email}</span>}
              <span className="text-ivory/40 text-xs font-sans">{user?.phone}</span>
              {user?.emailVerified && <span className="text-[9px] tracking-widest uppercase font-sans text-green-400/70 border border-green-400/20 px-2 py-0.5">Email verified</span>}
              {user?.phoneVerified && <span className="text-[9px] tracking-widest uppercase font-sans text-green-400/70 border border-green-400/20 px-2 py-0.5">Phone verified</span>}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs tracking-widest uppercase font-sans transition-all ${
                    activeTab === tab.id ? 'bg-obsidian text-gold-400 border-l-2 border-gold-400' : 'text-obsidian/50 hover:text-obsidian border-l-2 border-transparent'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-xs tracking-widest uppercase font-sans text-obsidian/30 hover:text-terracotta border-l-2 border-transparent transition-all mt-4">
                <LogOut size={14} />
                Sign Out
              </button>
            </nav>
          </div>

          <div className="lg:col-span-3">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {activeTab === 'profile' && (
                <form onSubmit={saveProfile} className="bg-white border border-obsidian/6 p-8" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <h2 className="font-serif text-obsidian text-2xl font-light mb-6">Personal Information</h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="First Name" value={profile.firstName} onChange={(value) => setProfile({ ...profile, firstName: value })} />
                    <Field label="Last Name" value={profile.lastName} onChange={(value) => setProfile({ ...profile, lastName: value })} />
                    <ReadOnly label="Email Address" value={user?.email || 'Not added'} />
                    <Field label="Phone Number" value={profile.phone} onChange={(value) => setProfile({ ...profile, phone: value })} />
                  </div>
                  <button type="submit" disabled={saving} className="btn-gold mt-6 flex items-center gap-2">
                    <Save size={14} /> Save Profile
                  </button>
                </form>
              )}

              {activeTab === 'orders' && (
                <div className="bg-white border border-obsidian/6 p-8" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <h2 className="font-serif text-obsidian text-2xl font-light mb-6">Order History</h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-16">
                      <ShoppingBag size={40} className="mx-auto mb-4 text-obsidian/15" />
                      <p className="font-serif text-obsidian/40 text-xl font-light">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="border border-obsidian/8 p-4">
                          <div className="flex flex-wrap justify-between gap-3 mb-3">
                            <div>
                              <p className="font-sans text-sm text-obsidian">{order.orderNumber}</p>
                              <p className="text-xs text-obsidian/40">{new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-serif text-xl text-obsidian">EUR {order.pricing?.total?.toFixed?.(2) || order.pricing?.total}</p>
                              <p className="text-[10px] uppercase tracking-widest text-gold-500">{order.status}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {order.items?.map((item: any) => (
                              <div key={`${order._id}-${item.productId}`} className="flex items-center gap-3 text-sm text-obsidian/60">
                                {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 object-cover" />}
                                <span className="flex-1">{item.name}</span>
                                <span>Qty {item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          {order.trackingNumber && (
                            <div className="mt-4 pt-3 border-t border-obsidian/4">
                              <p className="text-[10px] tracking-widest uppercase font-sans text-obsidian/40 mb-1">Tracking Number</p>
                              <p className="font-sans text-sm text-obsidian/80 font-mono tracking-wider">{order.trackingNumber}</p>
                            </div>
                          )}
                          <div className="mt-4 pt-4 border-t border-obsidian/8 flex justify-end gap-3 items-center">
                            {order.status === 'cancelling' && (
                              <span className="text-xs uppercase tracking-widest font-sans text-terracotta">
                                Cancellation Requested
                              </span>
                            )}
                            {(order.status === 'pending' || order.status === 'processing') && (
                              <button
                                onClick={() => handleCancelOrder(order._id)}
                                className="text-xs uppercase tracking-widest font-sans border border-terracotta/30 text-terracotta px-4 py-2 hover:bg-terracotta hover:text-white transition-colors"
                              >
                                Cancel Order
                              </button>
                            )}
                            {(order.status === 'delivered' || order.status === 'completed' || order.status === 'shipped') && (
                              <Link
                                to={`/returns?order=${order.orderNumber}&email=${encodeURIComponent(user?.email || '')}&firstName=${encodeURIComponent(user?.firstName || '')}&lastName=${encodeURIComponent(user?.lastName || '')}`}
                                className="text-xs uppercase tracking-widest font-sans border border-obsidian/20 px-4 py-2 text-obsidian hover:bg-obsidian hover:text-white transition-colors"
                              >
                                Request Exchange / Return
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="bg-white border border-obsidian/6 p-8" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <h2 className="font-serif text-obsidian text-2xl font-light mb-6">Saved Addresses</h2>
                  <div className="grid gap-4 mb-8">
                    {user?.shippingAddresses?.map((item) => (
                      <div key={item._id} className="border border-obsidian/8 p-4 flex justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-gold-500 mb-2">{item.label || 'Address'}</p>
                          <p className="text-sm text-obsidian">{item.address}</p>
                          <p className="text-sm text-obsidian/60">{item.city}, {item.zipCode}</p>
                          <p className="text-sm text-obsidian/60">{item.country}</p>
                        </div>
                        <button onClick={() => removeAddress(item._id)} className="text-terracotta hover:text-obsidian">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={saveAddress} className="border-t border-obsidian/8 pt-6">
                    <h3 className="font-serif text-obsidian text-xl font-light mb-4">Add Address</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Label" value={address.label || ''} onChange={(value) => setAddress({ ...address, label: value })} />
                      <Field label="Street Address" value={address.address} onChange={(value) => setAddress({ ...address, address: value })} />
                      <Field label="City" value={address.city} onChange={(value) => setAddress({ ...address, city: value })} />
                      <Field label="Zip Code" value={address.zipCode} onChange={(value) => setAddress({ ...address, zipCode: value })} />
                      <Field label="Country" value={address.country} onChange={(value) => setAddress({ ...address, country: value })} />
                    </div>
                    <button type="submit" className="btn-gold mt-5 flex items-center gap-2">
                      <Plus size={14} /> Add Address
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="bg-white border border-obsidian/6 p-8" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <h2 className="font-serif text-obsidian text-2xl font-light mb-6">Security</h2>
                  <div className="space-y-4">
                    <SecurityRow label="Email Verified" status={!!user?.emailVerified} value={user?.email || ''} />
                    <SecurityRow label="Phone Verified" status={!!user?.phoneVerified} value={user?.phone || ''} />
                    <button onClick={sendPasswordReset} className="btn-outline text-xs py-3">Send Password Reset SMS</button>
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

const Field: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-[10px] tracking-widest uppercase font-sans text-obsidian/40 mb-2">{label}</label>
    <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full text-obsidian font-sans text-sm py-3 px-4 border border-obsidian/8 bg-ivory/50 outline-none focus:border-gold-400/50" />
  </div>
);

const ReadOnly: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <label className="block text-[10px] tracking-widest uppercase font-sans text-obsidian/40 mb-2">{label}</label>
    <p className="text-obsidian/60 font-sans text-sm py-3 px-4 border border-obsidian/8 bg-ivory/50">{value}</p>
  </div>
);

const SecurityRow: React.FC<{ label: string; status: boolean; value: string }> = ({ label, status, value }) => (
  <div className="flex items-center justify-between p-4 border border-obsidian/8">
    <div>
      <p className="text-xs tracking-widest uppercase font-sans text-obsidian/50">{label}</p>
      <p className="text-obsidian font-sans text-sm mt-0.5">{value}</p>
    </div>
    <span className={`text-[9px] tracking-widest uppercase font-sans px-3 py-1 border ${status ? 'text-green-600 border-green-200 bg-green-50' : 'text-terracotta border-terracotta/20 bg-terracotta/5'}`}>
      {status ? 'Verified' : 'Unverified'}
    </span>
  </div>
);

export default Account;
