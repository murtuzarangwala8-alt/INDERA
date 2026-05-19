import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle2, PackageCheck, RotateCcw, ShieldCheck, Send, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Returns: React.FC = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    orderNumber: '',
    reason: '',
    description: '',
    resolution: 'refund',
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setFormData(prev => ({
      ...prev,
      orderNumber: params.get('order') || prev.orderNumber,
      email: params.get('email') || prev.email,
      firstName: params.get('firstName') || prev.firstName,
      lastName: params.get('lastName') || prev.lastName,
    }));
  }, [location]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(String(data.returnId));
        toast.success('Return request submitted successfully!');
      } else {
        toast.error(data.message || 'Failed to submit return request.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-obsidian text-ivory min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 lg:px-8 border-b border-ivory/10">
        <div className="max-w-5xl mx-auto">
          <p className="text-gold-400 uppercase tracking-[0.35em] text-xs mb-5">Customer Care</p>
          <h1 className="font-serif text-5xl md:text-7xl font-light tracking-wide mb-6">
            Exchanges &amp; Returns
          </h1>
          <p className="text-ivory/60 text-lg md:text-xl font-light leading-relaxed max-w-3xl">
            Returns and exchanges are available for eligible INDERA pieces. If your product arrives damaged,
            we offer a full refund or an exchange after review.
          </p>
        </div>
      </section>

      {/* Info cards */}
      <section className="px-6 lg:px-8 py-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5">
          {[
            {
              icon: PackageCheck,
              title: 'Returns Available',
              body: 'Eligible jewelry can be returned if it is unused, unworn, and sent back with original packaging.',
            },
            {
              icon: ShieldCheck,
              title: 'Damaged Product Protection',
              body: 'If an item is damaged on arrival, we can offer a refund or exchange once the issue is confirmed.',
            },
            {
              icon: RotateCcw,
              title: 'Exchange Option',
              body: 'When stock is available, you may choose an exchange instead of a return for your items.',
            },
          ].map((item) => (
            <article key={item.title} className="border border-ivory/10 p-6 bg-ivory/[0.02]">
              <item.icon className="text-gold-400 mb-5" size={28} />
              <h2 className="font-serif text-2xl mb-3">{item.title}</h2>
              <p className="text-ivory/55 text-sm leading-relaxed">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Policy details */}
      <section className="px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-3xl mb-4">Return Conditions</h2>
              <ul className="space-y-3 text-ivory/60 leading-relaxed">
                {[
                  'Contact us before sending any item back so we can approve the return.',
                  'Returned pieces must be unused, unworn, and in original packaging.',
                  'Custom, personalized, worn, or damaged-by-use items may not be eligible for return.',
                  'Return shipping instructions will be shared after your request is reviewed.',
                ].map((text) => (
                  <li key={text} className="flex gap-3">
                    <CheckCircle2 className="text-gold-400 shrink-0 mt-1" size={17} />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-3xl mb-4">Damaged Products</h2>
              <p className="text-ivory/60 leading-relaxed">
                If your order arrives damaged, contact us as soon as possible with your order
                number and clear photos of the item, packaging, and shipping label. Once verified,
                INDERA can provide a refund or arrange an exchange.
              </p>
            </div>
          </div>

          <aside className="border border-gold-400/30 p-8 bg-gold-400/[0.05] self-start">
            <h2 className="font-serif text-3xl mb-4">Need Help?</h2>
            <p className="text-ivory/60 leading-relaxed mb-6">
              Send us your order number and a short explanation. For damaged items, include photos
              so we can process your return or exchange faster.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 bg-gold-400 text-obsidian px-6 py-4 uppercase tracking-[0.2em] text-xs font-semibold hover:bg-gold-300 transition-colors"
            >
              Contact Support
              <ArrowRight size={16} />
            </Link>
          </aside>
        </div>
      </section>

      {/* Return Request Form */}
      <section className="px-6 lg:px-8 pb-24 border-t border-ivory/10">
        <div className="max-w-3xl mx-auto pt-16">
          <p className="text-gold-400 uppercase tracking-[0.35em] text-xs mb-4">Submit a Request</p>
          <h2 className="font-serif text-4xl font-light mb-2">Request an Exchange or Return</h2>
          <p className="text-ivory/50 text-sm mb-10 leading-relaxed">
            Fill in the form below and our team will review your request within 2–3 business days.
            You will receive a confirmation email with your reference number.
          </p>

          {submitted ? (
            <div className="border border-gold-400/30 p-10 bg-gold-400/[0.04] text-center">
              <CheckCircle2 size={48} className="text-gold-400 mx-auto mb-5" />
              <h3 className="font-serif text-2xl mb-3">Request Submitted</h3>
              <p className="text-ivory/60 mb-4">
                Your return request has been received. Check your email for confirmation.
              </p>
              <p className="text-xs uppercase tracking-widest text-ivory/40 mb-2">Return Reference</p>
              <p className="font-mono text-gold-400 text-lg">{submitted}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-ivory/40 mb-2">First Name</label>
                  <input
                    name="firstName" required value={formData.firstName} onChange={handleChange}
                    className="w-full bg-transparent border border-ivory/15 text-ivory text-base px-4 py-3 outline-none focus:border-gold-400/50 transition-colors placeholder:text-ivory/20"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-ivory/40 mb-2">Last Name</label>
                  <input
                    name="lastName" required value={formData.lastName} onChange={handleChange}
                    className="w-full bg-transparent border border-ivory/15 text-ivory text-base px-4 py-3 outline-none focus:border-gold-400/50 transition-colors placeholder:text-ivory/20"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-widest uppercase text-ivory/40 mb-2">Email Address</label>
                <input
                  name="email" type="email" required value={formData.email} onChange={handleChange}
                  className="w-full bg-transparent border border-ivory/15 text-ivory text-base px-4 py-3 outline-none focus:border-gold-400/50 transition-colors placeholder:text-ivory/20"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-widest uppercase text-ivory/40 mb-2">Order Number</label>
                <input
                  name="orderNumber" required value={formData.orderNumber} onChange={handleChange}
                  className="w-full bg-transparent border border-ivory/15 text-ivory text-base px-4 py-3 outline-none focus:border-gold-400/50 transition-colors placeholder:text-ivory/20"
                  placeholder="e.g. INDERA-2024-001"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-ivory/40 mb-2">Return Reason</label>
                  <select
                    name="reason" required value={formData.reason} onChange={handleChange}
                    className="w-full bg-obsidian border border-ivory/15 text-ivory text-base px-4 py-3 outline-none focus:border-gold-400/50 transition-colors"
                  >
                    <option value="" disabled>Select a reason</option>
                    <option value="damaged">Damaged on arrival</option>
                    <option value="wrong_item">Wrong item received</option>
                    <option value="not_as_described">Not as described</option>
                    <option value="changed_mind">Changed my mind</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-ivory/40 mb-2">I Would Like</label>
                  <select
                    name="resolution" required value={formData.resolution} onChange={handleChange}
                    className="w-full bg-obsidian border border-ivory/15 text-ivory text-base px-4 py-3 outline-none focus:border-gold-400/50 transition-colors"
                  >
                    <option value="exchange">Exchange</option>
                    <option value="refund">Return</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-widest uppercase text-ivory/40 mb-2">Description</label>
                <textarea
                  name="description" required rows={5} value={formData.description} onChange={handleChange}
                  className="w-full bg-transparent border border-ivory/15 text-ivory text-base px-4 py-3 outline-none focus:border-gold-400/50 transition-colors resize-none placeholder:text-ivory/20"
                  placeholder="Please describe the issue in detail. For damaged items, describe the damage and attach photos by email after submission."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-3 bg-gold-400 text-obsidian px-8 py-4 uppercase tracking-[0.2em] text-xs font-semibold hover:bg-gold-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><Loader size={16} className="animate-spin" /> Submitting...</>
                ) : (
                  <><Send size={16} /> Submit Request</>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Returns;
