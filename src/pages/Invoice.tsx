import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, Printer, ArrowLeft } from 'lucide-react';
import { adminFetchOrderById } from '../services/api';
import toast from 'react-hot-toast';

const Invoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const res = await adminFetchOrderById(id);
        if (res.success) {
          setOrder(res.order);
        } else {
          toast.error(res.message || 'Failed to load order');
          navigate('/admin');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Network error');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center text-ivory">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={48} />
          <p className="font-serif text-xl">Loading Invoice...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center text-ivory">
        <p className="font-serif text-xl">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
      {/* Controls - Hidden on Print */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-ivory/60 hover:text-ivory transition-colors text-sm font-sans uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <button
          onClick={handlePrint}
          className="btn-gold flex items-center gap-2 py-2 px-4 text-sm"
        >
          <Printer size={16} /> Print Invoice
        </button>
      </div>

      {/* Invoice Container */}
      <div className="max-w-4xl mx-auto bg-white text-charcoal p-10 sm:p-16 shadow-2xl print:shadow-none print:p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-gold-400/20 pb-8 mb-8 gap-6 sm:gap-0">
          <div>
            <h1 className="font-serif text-4xl font-light tracking-wide text-obsidian">INDÉRA</h1>
            <p className="text-[10px] tracking-[0.3em] uppercase font-sans text-gold-500 mt-1">Fine Jewelry</p>
          </div>
          <div className="text-left sm:text-right">
            <h2 className="font-serif text-2xl font-light text-obsidian uppercase tracking-wide">Invoice</h2>
            <p className="text-xs font-sans text-charcoal/60 mt-1">Order # {order.orderNumber}</p>
            <p className="text-xs font-sans text-charcoal/60">{new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
          <div>
            <p className="text-[10px] tracking-widest uppercase font-sans text-charcoal/40 mb-2">Billed To</p>
            <p className="font-sans text-sm font-medium text-obsidian">{order.customer?.firstName} {order.customer?.lastName}</p>
            <p className="text-xs font-sans text-charcoal/70 mt-1">{order.customer?.email}</p>
            <p className="text-xs font-sans text-charcoal/70">{order.customer?.phone}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] tracking-widest uppercase font-sans text-charcoal/40 mb-2">Shipped To</p>
            <p className="font-sans text-sm font-medium text-obsidian">{order.customer?.firstName} {order.customer?.lastName}</p>
            {order.shippingAddress && (
              <p className="text-xs font-sans text-charcoal/70 mt-1 leading-relaxed">
                {order.shippingAddress.address}<br />
                {order.shippingAddress.city}, {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </p>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mb-10">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-charcoal/10 text-[10px] tracking-widest uppercase text-charcoal/50">
                <th className="text-left py-3 font-medium">Item Description</th>
                <th className="text-center py-3 font-medium">Qty</th>
                <th className="text-right py-3 font-medium">Unit Price</th>
                <th className="text-right py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {(order.items || []).map((item: any, idx: number) => (
                <tr key={idx} className="text-charcoal/80">
                  <td className="py-4 text-left">
                    <p className="font-medium text-obsidian">{item.name}</p>
                    <p className="text-xs text-charcoal/50 mt-0.5">{item.brand || 'INDÉRA'}</p>
                  </td>
                  <td className="py-4 text-center">{item.quantity}</td>
                  <td className="py-4 text-right">EUR {item.price.toFixed(2)}</td>
                  <td className="py-4 text-right text-obsidian font-medium">EUR {(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-full sm:w-80 space-y-3 text-sm font-sans">
            <div className="flex justify-between text-charcoal/70">
              <span className="text-[10px] tracking-widest uppercase">Subtotal</span>
              <span>EUR {order.pricing?.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-charcoal/70">
              <span className="text-[10px] tracking-widest uppercase">Shipping</span>
              <span>{order.pricing?.shipping === 0 ? 'Complimentary' : `EUR ${order.pricing?.shipping?.toFixed(2)}`}</span>
            </div>
            {order.pricing?.tax > 0 && (
              <div className="flex justify-between text-charcoal/70">
                <span className="text-[10px] tracking-widest uppercase">Tax</span>
                <span>EUR {order.pricing?.tax?.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t-2 border-gold-400/20 pt-3 mt-3 flex justify-between items-baseline">
              <span className="text-xs tracking-widest uppercase font-medium text-obsidian">Total</span>
              <span className="font-serif text-2xl text-gold-500">EUR {order.pricing?.total?.toFixed(2)}</span>
            </div>

            {/* Payment Status Badge */}
            <div className="text-right mt-4">
              <span className={`text-[9px] tracking-widest uppercase font-sans px-2 py-1 border ${
                order.payment?.status === 'completed' ? 'border-green-400/50 text-green-600 bg-green-50' : 'border-gold-400/50 text-gold-600 bg-gold-50'
              }`}>
                Payment: {order.payment?.status || 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-charcoal/10 pt-8 mt-16 text-center text-xs font-sans text-charcoal/40 space-y-1">
          <p className="font-medium text-charcoal/60">Thank you for your purchase.</p>
          <p>For any inquiries, please contact support@indera.it</p>
          <p className="pt-4 text-[9px] tracking-wider uppercase">INDÉRA · Milan, Italy</p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
