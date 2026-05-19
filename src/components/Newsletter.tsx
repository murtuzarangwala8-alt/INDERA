import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success('Welcome to the INDÉRA private list.');
    setEmail('');
  };

  return (
    <section className="py-28 px-6 bg-charcoal relative overflow-hidden">
      {/* Background accent */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1200&q=40")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl"
        style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }} />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-gold-400 text-[10px] tracking-[0.4em] uppercase font-sans mb-6">
            Private Access
          </p>
          <h2 className="font-serif text-ivory text-5xl font-light mb-4">
            Join the INDÉRA
            <br />
            <em className="gold-text not-italic">Private List</em>
          </h2>
          <p className="text-ivory/40 font-sans font-light text-base leading-relaxed mb-10">
            Early access to new collections, exclusive pieces, artisan stories,
            and invitations to private events across Europe.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="flex-1 bg-transparent border border-gold-400/30 text-ivory placeholder-ivory/30 px-5 py-3 text-base font-sans outline-none focus:border-gold-400/60 transition-colors"
            />
            <button type="submit" className="btn-gold whitespace-nowrap">
              Join Now
            </button>
          </form>

          <p className="text-ivory/20 text-[10px] tracking-widest uppercase font-sans mt-6">
            No spam. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
